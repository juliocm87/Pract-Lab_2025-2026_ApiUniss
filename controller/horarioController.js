const Horarios = require("../models/horarios");
const Carreras = require("../models/carreras");
const Cursos = require("../models/cursos");

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getAllHorarios = async (filters = {}) => {
  const where = {};

  if (filters.carreraId) {
    where.carreraId = toNumberOrNull(filters.carreraId);
  }

  if (filters.cursoId) {
    where.cursoId = toNumberOrNull(filters.cursoId);
  }

  console.log(
    "[horarioController] getAllHorarios -> filtros recibidos:",
    filters,
  );
  console.log("[horarioController] getAllHorarios -> where aplicado:", where);

  const horarios = await Horarios.findAll({
    where,
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
    order: [
      ["carreraId", "ASC"],
      ["numero_semana", "ASC"],
      ["id", "ASC"],
    ],
  });

  console.log(
    "[horarioController] getAllHorarios -> resultados:",
    horarios.map((h) => ({
      id: h.id,
      carreraId: h.carreraId,
      cursoId: h.cursoId,
      numero_semana: h.numero_semana,
      carrera: h.carrera?.nombre_carrera || null,
    })),
  );

  return horarios;
};

module.exports = {
  getAllHorarios,
};
