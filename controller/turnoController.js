const Turnos = require("../models/turnos");
const Asignaturas = require("../models/asignaturas");
const AsignaturaCarreras = require("../models/asignaturaCarreras");
const Docentes = require("../models/docentes");
const Horarios = require("../models/horarios");
const Carreras = require("../models/carreras");
const Cursos = require("../models/cursos");
const Trabajadores = require("../models/trabajadores");
const { Op } = require("sequelize");
const AppError = require("../error/AppError");

const ESTADOS_VALIDOS = ["disponible", "asignado", "cancelado"];

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizarTurnoData = (turnoData = {}) => ({
  dia_semana: toNumberOrNull(turnoData.dia_semana),
  horario_inicio: turnoData.horario_inicio,
  horario_fin: turnoData.horario_fin,
  estado: turnoData.estado || "asignado",
  asignaturaId: toNumberOrNull(
    turnoData.asignaturaId ?? turnoData.asignatura_id,
  ),
  docenteCI: turnoData.docenteCI ?? turnoData.docente_ci ?? null,
  horarioId: toNumberOrNull(turnoData.horarioId ?? turnoData.horario_id),
  carreraId: toNumberOrNull(turnoData.carreraId ?? turnoData.carrera_id),
  fecha: turnoData.fecha ? new Date(turnoData.fecha) : null,
});

const getTurnoIncludes = () => [
  {
    model: Asignaturas,
    as: "asignatura",
    required: false,
    include: [
      {
        model: AsignaturaCarreras,
        attributes: ["carreraId", "horas_clase", "anno_academico"],
        required: false,
      },
    ],
  },
  {
    model: Docentes,
    as: "docente",
    required: false,
    include: [
      {
        model: Trabajadores,
        required: false,
      },
    ],
  },
  {
    model: Horarios,
    as: "horario",
    required: false,
    include: [
      {
        model: Carreras,
        as: "carrera",
        required: false,
      },
      {
        model: Cursos,
        as: "curso",
        required: false,
      },
    ],
  },
];

const validarRangoHorario = (horario_inicio, horario_fin) => {
  if (!horario_inicio || !horario_fin) {
    throw new AppError("La hora de inicio y fin son requeridas", 400);
  }

  const [startHour, startMin] = horario_inicio.split(":").map(Number);
  const [endHour, endMin] = horario_fin.split(":").map(Number);

  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMin) ||
    Number.isNaN(endHour) ||
    Number.isNaN(endMin)
  ) {
    throw new AppError("Formato de hora inválido. Use HH:MM", 400);
  }

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (endMinutes <= startMinutes) {
    throw new AppError(
      "La hora de fin debe ser posterior a la hora de inicio",
      400,
    );
  }
};

const validarDiaSemana = (dia_semana) => {
  if (!dia_semana || dia_semana < 1 || dia_semana > 7) {
    throw new AppError("El día de la semana debe estar entre 1 y 7", 400);
  }
};

const getTurnoCompletoById = async (turnoId) => {
  const turno = await Turnos.findByPk(turnoId, {
    include: getTurnoIncludes(),
  });

  if (!turno) {
    throw new AppError("Turno no encontrado", 404);
  }

  return turno;
};

const sumarDias = (fecha, dias) => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setDate(nuevaFecha.getDate() + dias);
  return nuevaFecha;
};

const getInicioSemana = (fecha) => {
  const base = new Date(fecha);
  const dia = base.getDay();
  const desplazamiento = dia === 0 ? -6 : 1 - dia;
  base.setDate(base.getDate() + desplazamiento);
  base.setHours(0, 0, 0, 0);
  return base;
};

const getFinSemana = (fecha) => {
  return sumarDias(getInicioSemana(fecha), 6);
};

const calcularNumeroSemana = (cursoActivo, fechaInicioSemana) => {
  if (!cursoActivo?.fecha_inicio) return 1;

  const inicioCurso = getInicioSemana(new Date(cursoActivo.fecha_inicio));
  const inicioSemana = getInicioSemana(new Date(fechaInicioSemana));
  const diferenciaMs = inicioSemana.getTime() - inicioCurso.getTime();
  const semanas = Math.floor(diferenciaMs / (7 * 24 * 60 * 60 * 1000)) + 1;

  return Math.max(1, semanas);
};

const resolverOCrearHorario = async ({
  horarioId,
  carreraId,
  horario_inicio,
  horario_fin,
  fecha,
}) => {
  if (horarioId) {
    const horarioExistente = await Horarios.findByPk(horarioId);

    if (!horarioExistente) {
      throw new AppError("Horario no encontrado", 404);
    }

    if (!fecha) {
      return horarioExistente;
    }

    const fechaReferencia = new Date(fecha);
    const inicioExistente = new Date(horarioExistente.fecha_inicio_semana);
    const finExistente = new Date(horarioExistente.fecha_fin_semana);

    if (fechaReferencia >= inicioExistente && fechaReferencia <= finExistente) {
      return horarioExistente;
    }

    console.log(
      "[turnoController] El horarioId enviado no corresponde a la semana de la fecha seleccionada. Se resolverá por carrera/fecha.",
      {
        horarioId,
        carreraId,
        fecha: fechaReferencia,
        fecha_inicio_semana: horarioExistente.fecha_inicio_semana,
        fecha_fin_semana: horarioExistente.fecha_fin_semana,
      },
    );

    if (!carreraId) {
      carreraId = horarioExistente.carreraId;
    }
  }

  if (!carreraId) {
    throw new AppError("Debe enviarse horarioId o carreraId", 400);
  }

  const cursoActivo = await Cursos.findOne({
    where: { estado: "activo" },
    order: [["fecha_inicio", "ASC"]],
  });

  const fechaReferencia = fecha || cursoActivo?.fecha_inicio || new Date();
  const fechaInicioSemana = getInicioSemana(new Date(fechaReferencia));
  const fechaFinSemana = getFinSemana(new Date(fechaReferencia));

  let horario = await Horarios.findOne({
    where: {
      carreraId,
      fecha_inicio_semana: fechaInicioSemana,
      fecha_fin_semana: fechaFinSemana,
    },
    order: [["id", "ASC"]],
  });

  if (!horario) {
    horario = await Horarios.create({
      numero_semana: calcularNumeroSemana(cursoActivo, fechaInicioSemana),
      fecha_inicio_semana: fechaInicioSemana,
      fecha_fin_semana: fechaFinSemana,
      hora_inicio: horario_inicio,
      horario_fin,
      cursoId: cursoActivo?.id || null,
      carreraId,
    });

    console.log("[turnoController] Se creó horario automáticamente:", {
      horarioId: horario.id,
      carreraId,
      cursoId: cursoActivo?.id || null,
    });

    return horario;
  }

  const cambios = {};

  if (
    horario_inicio &&
    (!horario.hora_inicio || horario_inicio < horario.hora_inicio)
  ) {
    cambios.hora_inicio = horario_inicio;
  }

  if (
    horario_fin &&
    (!horario.horario_fin || horario_fin > horario.horario_fin)
  ) {
    cambios.horario_fin = horario_fin;
  }

  if (Object.keys(cambios).length > 0) {
    await horario.update(cambios);
  }

  return horario;
};

const validarReferenciasTurno = async (
  {
    asignaturaId,
    docenteCI,
    horarioId,
    carreraId,
    estado,
    horario_inicio,
    horario_fin,
    fecha,
  },
  turnoIdExcluir = null,
) => {
  if (!asignaturaId) {
    throw new AppError("La asignatura es requerida", 400);
  }

  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw new AppError(
      `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(", ")}`,
      400,
    );
  }

  const [asignatura, docente] = await Promise.all([
    Asignaturas.findByPk(asignaturaId),
    docenteCI
      ? Docentes.findOne({ where: { trabajadorId: docenteCI } })
      : Promise.resolve(null),
  ]);

  if (!asignatura) {
    throw new AppError("Asignatura no encontrada", 404);
  }

  if (docenteCI && !docente) {
    throw new AppError("Docente no encontrado", 404);
  }

  const horario = await resolverOCrearHorario({
    horarioId,
    carreraId,
    horario_inicio,
    horario_fin,
    fecha,
  });

  return { asignatura, horario, docente };
};

const validarTurnoDuplicado = async (
  { dia_semana, horario_inicio, horario_fin, horarioId },
  turnoIdExcluir = null,
) => {
  const existente = await Turnos.findOne({
    where: {
      dia_semana,
      horario_inicio,
      horario_fin,
      horarioId,
    },
  });

  if (existente && String(existente.id) !== String(turnoIdExcluir)) {
    throw new AppError(
      "Ya existe un turno creado para ese día, hora y horario",
      409,
    );
  }
};

const getAllTurnos = async (filters = {}) => {
  const where = {};
  const horarioWhere = {};

  console.log("[turnoController] getAllTurnos -> filtros recibidos:", filters);

  if (filters.asignaturaId) {
    where.asignaturaId = toNumberOrNull(filters.asignaturaId);
  }

  if (filters.docenteCI) {
    where.docenteCI = filters.docenteCI;
  }

  if (filters.horarioId) {
    where.horarioId = toNumberOrNull(filters.horarioId);
  }

  if (filters.estado) {
    where.estado = filters.estado;
  }

  if (filters.carreraId) {
    horarioWhere.carreraId = toNumberOrNull(filters.carreraId);
  }

  if (filters.cursoId) {
    horarioWhere.cursoId = toNumberOrNull(filters.cursoId);
  }

  if (Object.keys(horarioWhere).length > 0) {
    const horariosFiltrados = await Horarios.findAll({
      where: horarioWhere,
      attributes: ["id"],
      raw: true,
    });

    const horarioIds = horariosFiltrados.map((item) => item.id);
    console.log(
      "[turnoController] getAllTurnos -> horarioIds filtrados:",
      horarioIds,
    );

    if (horarioIds.length === 0) {
      return [];
    }

    where.horarioId = where.horarioId
      ? { [Op.in]: horarioIds.filter((id) => id === where.horarioId) }
      : { [Op.in]: horarioIds };
  }

  console.log("[turnoController] getAllTurnos -> where final:", where);

  const turnos = await Turnos.findAll({
    where,
    order: [
      ["horarioId", "ASC"],
      ["dia_semana", "ASC"],
      ["horario_inicio", "ASC"],
    ],
  });

  console.log(
    "[turnoController] getAllTurnos -> turnos base encontrados:",
    turnos.length,
  );

  if (turnos.length === 0) {
    return [];
  }

  const turnosPlain = turnos.map((turno) => turno.toJSON());
  const asignaturaIds = [
    ...new Set(turnosPlain.map((t) => t.asignaturaId).filter(Boolean)),
  ];
  const horarioIds = [
    ...new Set(turnosPlain.map((t) => t.horarioId).filter(Boolean)),
  ];
  const docenteIds = [
    ...new Set(turnosPlain.map((t) => t.docenteCI).filter(Boolean)),
  ];

  const [asignaturas, asignaturaCarreras, horarios, docentes] =
    await Promise.all([
      asignaturaIds.length
        ? Asignaturas.findAll({ where: { id: { [Op.in]: asignaturaIds } } })
        : Promise.resolve([]),
      asignaturaIds.length
        ? AsignaturaCarreras.findAll({
            where: { asignaturaId: { [Op.in]: asignaturaIds } },
          })
        : Promise.resolve([]),
      horarioIds.length
        ? Horarios.findAll({
            where: { id: { [Op.in]: horarioIds } },
            include: [
              { model: Carreras, as: "carrera", required: false },
              { model: Cursos, as: "curso", required: false },
            ],
          })
        : Promise.resolve([]),
      docenteIds.length
        ? Docentes.findAll({
            where: { trabajadorId: { [Op.in]: docenteIds } },
            include: [{ model: Trabajadores, required: false }],
          })
        : Promise.resolve([]),
    ]);

  const asignaturaCarrerasMap = asignaturaCarreras.reduce((acc, item) => {
    const key = item.asignaturaId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item.toJSON());
    return acc;
  }, {});

  const asignaturasMap = asignaturas.reduce((acc, item) => {
    const plain = item.toJSON();
    plain.AsignaturaCarreras = asignaturaCarrerasMap[item.id] || [];
    acc[item.id] = plain;
    return acc;
  }, {});

  const horariosMap = horarios.reduce((acc, item) => {
    acc[item.id] = item.toJSON();
    return acc;
  }, {});

  const docentesMap = docentes.reduce((acc, item) => {
    acc[item.trabajadorId] = item.toJSON();
    return acc;
  }, {});

  const resultado = turnosPlain.map((turno) => ({
    ...turno,
    asignatura: asignaturasMap[turno.asignaturaId] || null,
    horario: horariosMap[turno.horarioId] || null,
    docente: turno.docenteCI ? docentesMap[turno.docenteCI] || null : null,
  }));

  console.log(
    "[turnoController] getAllTurnos -> respuesta final:",
    resultado.length,
  );

  return resultado;
};

const asignarTurno = async (turnoData) => {
  const data = normalizarTurnoData(turnoData);

  validarDiaSemana(data.dia_semana);
  validarRangoHorario(data.horario_inicio, data.horario_fin);

  const { horario } = await validarReferenciasTurno(data);
  data.horarioId = horario.id;

  await validarTurnoDuplicado(data);

  console.log("[turnoController] Creando turno con datos:", data);

  const nuevoTurno = await Turnos.create({
    dia_semana: data.dia_semana,
    horario_inicio: data.horario_inicio,
    horario_fin: data.horario_fin,
    estado: data.estado,
    asignaturaId: data.asignaturaId,
    docenteCI: data.docenteCI,
    horarioId: data.horarioId,
  });
  return getTurnoCompletoById(nuevoTurno.id);
};

const cancelarTurno = async (turnoId) => {
  const turno = await Turnos.findByPk(turnoId);

  if (!turno) {
    throw new AppError("Turno no encontrado", 404);
  }

  await turno.destroy();
  return { mensaje: "Turno eliminado exitosamente" };
};

const modificarTurno = async (turnoId, newData) => {
  const turno = await Turnos.findByPk(turnoId);

  if (!turno) {
    throw new AppError("Turno no encontrado", 404);
  }

  const mergedData = {
    dia_semana: newData.dia_semana ?? turno.dia_semana,
    horario_inicio: newData.horario_inicio ?? turno.horario_inicio,
    horario_fin: newData.horario_fin ?? turno.horario_fin,
    estado: newData.estado ?? turno.estado,
    asignaturaId:
      newData.asignaturaId ?? newData.asignatura_id ?? turno.asignaturaId,
    docenteCI: newData.docenteCI ?? newData.docente_ci ?? turno.docenteCI,
    horarioId: newData.horarioId ?? newData.horario_id ?? turno.horarioId,
    carreraId: newData.carreraId ?? newData.carrera_id ?? null,
  };

  mergedData.dia_semana = toNumberOrNull(mergedData.dia_semana);
  mergedData.asignaturaId = toNumberOrNull(mergedData.asignaturaId);
  mergedData.horarioId = toNumberOrNull(mergedData.horarioId);
  mergedData.carreraId = toNumberOrNull(mergedData.carreraId);

  validarDiaSemana(mergedData.dia_semana);
  validarRangoHorario(mergedData.horario_inicio, mergedData.horario_fin);

  const { horario } = await validarReferenciasTurno(mergedData, turnoId);
  mergedData.horarioId = horario.id;

  await validarTurnoDuplicado(mergedData, turnoId);

  await turno.update({
    dia_semana: mergedData.dia_semana,
    horario_inicio: mergedData.horario_inicio,
    horario_fin: mergedData.horario_fin,
    estado: mergedData.estado,
    asignaturaId: mergedData.asignaturaId,
    docenteCI: mergedData.docenteCI,
    horarioId: mergedData.horarioId,
  });
  return getTurnoCompletoById(turno.id);
};

module.exports = {
  getAllTurnos,
  asignarTurno,
  cancelarTurno,
  modificarTurno,
};
