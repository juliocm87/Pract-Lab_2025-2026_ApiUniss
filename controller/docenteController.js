const Docentes = require("../models/docentes");
const Trabajadores = require("../models/trabajadores");
const Asignaturas = require("../models/asignaturas");
const Turnos = require("../models/turnos");
const AsignaturaCarreras = require("../models/asignaturaCarreras");
const AppError = require("../error/AppError");

/**
 * Obtiene un docente por su CI con todas sus relaciones
 */
const getDocenteByCI = async (ci) => {
  try {
    const docente = await Docentes.findOne({
      where: { trabajadorId: ci },
      include: [
        {
          model: Trabajadores,
        }
      ]
    });

    if (!docente) {
      throw new AppError("Docente no encontrado", 404);
    }

    return docente;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene las asignaturas asignadas a un docente
 */
const getAsignaturasByDocenteCI = async (ci) => {
  try {
    // Primero verificar que el docente existe
    const docente = await Docentes.findOne({
      where: { trabajadorId: ci }
    });

    if (!docente) {
      throw new AppError("Docente no encontrado", 404);
    }

    // Obtener asignaturas a través de la tabla intermedia AsignaturaCarreras
    // Nota: Necesitamos ajustar esto según la estructura real de la base de datos
    // Por ahora, retornamos las asignaturas que el docente podría tener asignadas
    const asignaturas = await Asignaturas.findAll({
      where: {
        facultad: docente.facultadId
      }
    });

    return asignaturas;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene los turnos asignados a un docente
 */
const getTurnosByDocenteCI = async (ci) => {
  try {
    // Verificar que el docente existe
    const docente = await Docentes.findOne({
      where: { trabajadorId: ci }
    });

    if (!docente) {
      throw new AppError("Docente no encontrado", 404);
    }

    // Obtener turnos asignados a este docente
    const turnos = await Turnos.findAll({
      where: { 
        docenteCI: ci,
        estado: 'asignado'
      },
      include: [
        {
          model: Asignaturas,
          as: "asignatura"
        }
      ]
    });

    return turnos;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene docentes filtrados por facultad
 */
const getDocentesByFacultad = async (facultadId) => {
  try {
    const trabajadores = await Trabajadores.findAll({
      where: { facultad: facultadId },
      include: [
        {
          model: Docentes,
          required: true, // Solo trabajadores que son docentes
          attributes: ['trabajadorId', 'facultadId', 'cargo']
        }
      ],
      attributes: ['ci', 'nombre', 'apellido', 'telefono', 'nivel_escolaridad', 'categoria', 'sexo', 'email', 'facultad']
    });

    return trabajadores;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getDocenteByCI,
  getAsignaturasByDocenteCI,
  getTurnosByDocenteCI,
  getDocentesByFacultad
};
