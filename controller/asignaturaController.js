const AppError = require("../error/AppError");
const Asignatura = require("../models/asignaturas");
const sigenuService = require("../services/sigenu.service");
const Torres = require("../models/torres");
const Trabajador = require("../models/trabajadores");
const Cuarto = require("../models/cuartos");
const Piso = require("../models/pisos");
const Estudiantes = require("../models/estudiantes");
const { Op, where } = require("sequelize");
const sigenu = require("../services/sigenu.service")

const getAsignaturasPorSemestre = async (limit = 10, offset = 0, facultadId, semestre) => {
  const whereClause = {};
  const includeClause = {}
  whereClause[Op.or] = [
    {
      facultad: {
        [Op.iLike]: `%${facultadId}`
      }
    },
    {
      semestre: {
        [Op.or]: `%${semestre}`
      }
    }
  ]
  const asignaturas = await Asignatura.findAndCountAll({
    include: includeClause,
    where: whereClause,
    offset,
    limit
  })
  return asignaturas
};
const getAsignatura = async (offset = 0, limit = 10, searchTerm = '') => {
    try {
    const whereClause = {};
    const includeClause = {}

    // Si hay un término de búsqueda, agregar condiciones de búsqueda
    if (searchTerm && searchTerm.trim() !== '') {
        whereClause[Op.or] = [
        {
            nombre_asignatura: {
                [Op.iLike]: `%${searchTerm}%`
            }
        },
        {
            facultad: {
                [Op.iLike]: `%${searchTerm}`
            }
        }
        ];
    }

    const asignaturas = await Asignatura.findAndCountAll({
        attributes: ["id", "nombre_asignatura", "facultad", "semestre"],
        include: includeClause,
        where: whereClause,
        offset,
        limit
    });
    return asignaturas;
    } catch (error) {
        throw error;
    }
};

const getAllAsignaturas = async () => {
    try {
    const asignaturas = await Asignatura.findAll({
        attributes: ["id", "nombre_asignatura", "facultad", "semestre"],
    });
    return asignaturas;
  } catch (error) {
    throw error;
  }
};

const createAsignatura = async (datos) => {
  try {
    const {
      nombre_asignatura,
      facultad,
      semestre
    } = datos
    if (facultad){
      try{
        await sigenu.getFacultyData(facultad)
      }catch(error){
        throw new AppError("Hubo un problema al buscar la facultad "+ error.message, 500)
      }
    }
    const asignatura = await Asignatura.create({ 
      nombre_asignatura,
      facultad,
      semestre
    });
    return asignatura;
  } catch (error) {
    throw error;
  }
};

const updateAsignatura = async (id, nombre_asignatura) => {
  try {
    const asignatura = await Asignatura.update(
      { nombre_asignatura},
      { where: { id } }
    );
    return asignatura;
  } catch (error) {
    throw error;
  }
};

const deleteAsignatura = async (id) => {
  try {
    const asignatura = await Asignatura.destroy({ where: { id } });
    return asignatura;
  } catch (error) {
    throw error;
  }
};

module.exports = { createAsignatura, updateAsignatura, getAsignatura, deleteAsignatura, getAllAsignaturas, getAsignaturasPorSemestre};
