const Incidencia = require("../models/incidencias");
const { enviarCorreo } = require("../services/smtp.service");
const { buscarEstudiantePorCI } = require("./estudianteController");
const Estudiantes = require("../models/estudiantes");
const sigenuService = require("../services/sigenu.service");

const getIncidencia = async () => {
  try {
    const incidencias = await Incidencia.findAll({
      include: [{
        model: Estudiantes,
        attributes: ['ci', 'nombre', 'apellido'],
        through: { attributes: [] } // No incluir atributos de la tabla intermedia
      }]
    });

    return incidencias;
  } catch (error) {
    throw error;
  }
};

// Función para formatear la fecha a mm/dd/yyyy
function formatearFecha(fecha) {
  if (!fecha) return '';
  // Si ya está en formato mm/dd/yyyy, solo retorna
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) return fecha;
  // Si viene en yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [anio, mes, dia] = fecha.split('-');
    return `${mes}/${dia}/${anio}`;
  }
  // Si viene en formato Date
  const d = new Date(fecha);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  const anio = d.getFullYear();
  return `${mes}/${dia}/${anio}`;
}

const validarCIs = async (cis) => {
  // Verificar duplicados
  const setCis = new Set(cis);
  if (setCis.size !== cis.length) {
    throw new Error('No se permiten CIs duplicados.');
  }
  // Verificar existencia en SIGENU o DB
  for (const ci of cis) {
    let encontrado = false;
    try {
      await sigenuService.getStudentData(ci);
      encontrado = true;
    } catch (err) {
      // Si no está en SIGENU, buscar en la DB
      const estudianteDB = await Estudiantes.findOne({ where: { ci } });
      if (estudianteDB) {
        encontrado = true;
      }
    }
    if (!encontrado) {
      throw new Error(`El carnet ${ci} no existe en el sistema.`);
    }
  }
};

const createIncidencia = async (tipo, descripcion, fecha, cis, enviarEmail = false) => {
  try {
    await validarCIs(cis);
    // Crear la incidencia primero
    const incidencia = await Incidencia.create({
      tipo,
      descripcion,
      fecha,
      cantidadImplicados: cis.length,
      correoEnviado: false // Se actualizará después si se envía el correo
    });

    // Buscar los estudiantes por CI
    const estudiantes = await Estudiantes.findAll({
      where: { ci: cis }
    });

    // Asociar los estudiantes a la incidencia
    await incidencia.setEstudiantes(cis);

    let correoEnviado = false;
    if (enviarEmail) {
      try {
        // Buscar datos de los estudiantes primero en SIGENU, luego en la DB
        const estudiantesInfo = [];
        for (const ci of cis) {
          let nombreCompleto = '';
          try {
            const datosSigenu = await sigenuService.getStudentData(ci);
            nombreCompleto = datosSigenu.datosPersonales?.nombreCompleto || '';
          } catch (err) {
            // Si no está en SIGENU, buscar en la DB
            const estudianteDB = await Estudiantes.findOne({ where: { ci } });
            if (estudianteDB) {
              nombreCompleto = `${estudianteDB.nombre || ''} ${estudianteDB.apellido || ''}`.trim();
            } else {
              nombreCompleto = 'Nombre no disponible';
            }
          }
          estudiantesInfo.push(`${nombreCompleto} (CI: ${ci})`);
        }
        const estudiantesTexto = estudiantesInfo.join(", ");
        const fechaFormateada = formatearFecha(fecha);
        await enviarCorreo({
          to: "dmesa@uniss.edu.cu", // Cambia esto por el correo real
          subject: cis.length > 1 ? "Nueva incidencia grupal registrada" : "Nueva incidencia registrada",
          text: cis.length > 1
            ? `Se ha registrado una nueva incidencia de tipo ${tipo} con ${cis.length} implicados: ${estudiantesTexto} con descripción: ${descripcion}. Fecha de ocurrencia: ${fechaFormateada}`
            : `Se ha registrado una nueva incidencia de tipo ${tipo} para ${estudiantesTexto} con descripción: ${descripcion}. Fecha de ocurrencia: ${fechaFormateada}`,
          html: cis.length > 1
            ? `<p>Se ha registrado una nueva incidencia de tipo <b>${tipo}</b> con <b>${cis.length} implicados</b>: <b>${estudiantesTexto}</b> con descripción: ${descripcion}.<br><b>Fecha de ocurrencia:</b> ${fechaFormateada}</p>`
            : `<p>Se ha registrado una nueva incidencia de tipo <b>${tipo}</b> para <b>${estudiantesTexto}</b> con descripción: ${descripcion}.<br><b>Fecha de ocurrencia:</b> ${fechaFormateada}</p>`
        });
        correoEnviado = true;
      } catch (error) {
        console.error("Error al enviar correo:", error);
        correoEnviado = false;
      }
    }

    // Actualizar el estado del correo en la incidencia
    incidencia.correoEnviado = correoEnviado;
    await incidencia.save();

    return incidencia;
  } catch (error) {
    throw error;
  }
};

const updateIncidencia = async (incidenciaId, tipo, descripcion, fecha, cis, enviarEmail = false) => {
  try {
    await validarCIs(cis);
    // Buscar la incidencia existente
    const incidencia = await Incidencia.findByPk(incidenciaId);
    if (!incidencia) return 0;

    // Actualizar los datos principales
    incidencia.tipo = tipo;
    incidencia.descripcion = descripcion;
    incidencia.fecha = fecha;
    incidencia.cantidadImplicados = cis.length;
    await incidencia.save();

    // Actualizar los estudiantes implicados
    await incidencia.setEstudiantes(cis);

    // Buscar los estudiantes para el correo
    const estudiantes = await Estudiantes.findAll({ where: { ci: cis } });

    let correoEnviado = false;
    if (enviarEmail) {
      try {
        // Buscar datos de los estudiantes primero en SIGENU, luego en la DB
        const estudiantesInfo = [];
        for (const ci of cis) {
          let nombreCompleto = '';
          try {
            const datosSigenu = await sigenuService.getStudentData(ci);
            nombreCompleto = datosSigenu.datosPersonales?.nombreCompleto || '';
          } catch (err) {
            // Si no está en SIGENU, buscar en la DB
            const estudianteDB = await Estudiantes.findOne({ where: { ci } });
            if (estudianteDB) {
              nombreCompleto = `${estudianteDB.nombre || ''} ${estudianteDB.apellido || ''}`.trim();
            } else {
              nombreCompleto = 'Nombre no disponible';
            }
          }
          estudiantesInfo.push(`${nombreCompleto} (CI: ${ci})`);
        }
        const estudiantesTexto = estudiantesInfo.join(", ");
        const fechaFormateada = formatearFecha(fecha);
        await enviarCorreo({
          to: "dmesa@uniss.edu.cu", // Cambia esto por el correo real
          subject: cis.length > 1 ? "Incidencia grupal editada" : "Incidencia editada",
          text: cis.length > 1
            ? `Se ha EDITADO una incidencia de tipo ${tipo} con ${cis.length} implicados: ${estudiantesTexto} con descripción: ${descripcion}. Fecha de ocurrencia: ${fechaFormateada}`
            : `Se ha EDITADO una incidencia de tipo ${tipo} para ${estudiantesTexto} con descripción: ${descripcion}. Fecha de ocurrencia: ${fechaFormateada}`,
          html: cis.length > 1
            ? `<p>Se ha <b>EDITADO</b> una incidencia de tipo <b>${tipo}</b> con <b>${cis.length} implicados</b>: <b>${estudiantesTexto}</b> con descripción: ${descripcion}.<br><b>Fecha de ocurrencia:</b> ${fechaFormateada}</p>`
            : `<p>Se ha <b>EDITADO</b> una incidencia de tipo <b>${tipo}</b> para <b>${estudiantesTexto}</b> con descripción: ${descripcion}.<br><b>Fecha de ocurrencia:</b> ${fechaFormateada}</p>`
        });
        correoEnviado = true;
      } catch (error) {
        console.error("Error al enviar correo:", error);
        correoEnviado = false;
      }
    }
    incidencia.correoEnviado = correoEnviado;
    await incidencia.save();

    return incidencia;
  } catch (error) {
    throw error;
  }
};

const deleteIncidencia = async (incidenciaId) => {
  try {
    const incidencia = await Incidencia.destroy({ where: { id: incidenciaId } });
    return incidencia;
  } catch (error) {
    console.error("Error al eliminar la incidencia:", error);
    throw error;
  }
};

const getIncidenciaPaginada = async (offset = 0, limit = 10) => {
  try {
    const incidencias = await Incidencia.findAndCountAll({
      include: [{
        model: Estudiantes,
        attributes: ['ci', 'nombre', 'apellido'],
        through: { attributes: [] }
      }],
      offset,
      limit
    });
    return incidencias;
  } catch (error) {
    throw error;
  }
};

module.exports = { createIncidencia, updateIncidencia, getIncidencia, deleteIncidencia, getIncidenciaPaginada }; 