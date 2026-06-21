const Cursos = require("../models/cursos");
const Carreras = require("../models/carreras");
const Asignaturas = require("../models/asignaturas");
const AsignaturaCarreras = require("../models/asignaturaCarreras");
const AppError = require("../error/AppError");

/**
 * Obtiene todos los cursos (años académicos)
 */
const getAllCursos = async () => {
  try {
    const cursos = await Cursos.findAll({
      order: [['fecha_inicio', 'DESC']]
    });
    return cursos;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene cursos asociados a una carrera específica
 */
const getCursosByCarreraId = async (carreraId) => {
  try {
    // Nota: Como Cursos y Carreras no tienen una relación directa en el modelo actual,
    // necesitamos obtener los cursos a través de Horarios que tienen carreraId
    const Horarios = require("../models/horarios");
    
    const cursos = await Cursos.findAll({
      include: [
        {
          model: Horarios,
          as: "horarios",
          where: { carreraId: carreraId },
          required: true
        }
      ],
      distinct: true
    });

    return cursos;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene asignaturas de un curso específico
 */
const getAsignaturasByCursoId = async (cursoId) => {
  try {
    // Obtener asignaturas a través de la tabla intermedia AsignaturaCarreras
    // Nota: Necesitamos ajustar esto según la estructura real de la base de datos
    const asignaturas = await Asignaturas.findAll({
      include: [
        {
          model: AsignaturaCarreras,
          where: { cursoId: cursoId },
          required: true
        }
      ]
    });

    return asignaturas;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllCursos,
  getCursosByCarreraId,
  getAsignaturasByCursoId
};
