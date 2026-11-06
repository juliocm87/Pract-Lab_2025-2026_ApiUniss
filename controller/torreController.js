const Torre = require("../models/torres");
const Piso = require("../models/pisos");
const Beca = require("../models/becas");
const { Op } = require("sequelize");


const getTorre = async (offset = 0, limit = 10, searchTerm = '') => {
  try {
    const whereClause = {};
    const includeClause = [
      {
        model: Beca,
        attributes: ["id", "nombre_beca"],
        required: false,
        as: 'beca'
      },
    ];

    // Si hay un término de búsqueda, agregar condiciones de búsqueda
    if (searchTerm && searchTerm.trim() !== '') {
      whereClause[Op.or] = [
        {
          nombre_torre: {
            [Op.iLike]: `%${searchTerm}%`
          }
        },
        {
          '$beca.nombre_beca$': {
            [Op.iLike]: `%${searchTerm}%`
          }
        }
      ];
    }

    const torres = await Torre.findAndCountAll({
      where: whereClause,
      include: includeClause,
      offset,
      limit
    });
    return torres;
  } catch (error) {
    throw error;
  }
};

const getAllTorres = async () => {
  try {
    const torres = await Torre.findAll({
      include: [
        {
          model: Beca,
          attributes: ["id", "nombre_beca"],
          required: false,
          as: 'beca'
        },
      ],
    });
    return torres;
  } catch (error) {
    throw error;
  }
};

const createTorre = async (nombre_torre, becaId) => {
  try {
    // Verificar si ya existe una torre con el mismo nombre en la misma beca
    const torreExistente = await Torre.findOne({
      where: {
        nombre_torre,
        becaId
      }
    });

    if (torreExistente) {
      throw new Error('Ya existe una torre con ese nombre en esta beca');
    }

    const torre = await Torre.create({
      nombre_torre,
      becaId,
    });
    return torre;
  } catch (error) {
    throw error;
  }
};

const updateTorre = async (id, nombre_torre, becaId) => {
  try {
    const torre = await Torre.update(
      {nombre_torre, becaId },
      { where: { id } }
    );
    return torre;
  } catch (error) {
    throw error;
  }
};

const deleteTorre = async (id) => {
  try {
    // Verificar si hay pisos asociados a la torre
    const pisosAsociados = await Piso.count({ where: { torreId: id } });
    if (pisosAsociados > 0) {
      throw new Error(
        "No se puede eliminar la torre porque tiene pisos asociados."
      );
    }

    const torre = await Torre.destroy({ where: { id } });
    return torre;
  } catch (error) {
    console.error("Error al eliminar la torre:", error);
    throw error;
  }
};

const verificarTorre = async (nombre_torre, becaId) => {
  try {
    const torreExistente = await Torre.findOne({
      where: {
        nombre_torre,
        becaId
      }
    });
    return torreExistente ? true : false;
  } catch (error) {
    throw error;
  }
};

const getTorresByBeca = async (becaId) => {
  try {
    const torres = await Torre.findAll({
      where: {
        becaId
      }
    });
    return torres;
  } catch (error) {
    throw error;
  }
};

const verificarPisosAsociados = async (id) => {
  try {
    // Buscar la torre para verificar que existe
    const torre = await Torre.findByPk(id);
    if (!torre) {
      throw new Error("Torre no encontrada");
    }

    // Buscar los pisos asociados a la torre
    const pisos = await Piso.findAll({
      where: { torreId: id },
      attributes: ['id', 'numero_piso', 'trabajadorId']
    });

    return {
      tienePisos: pisos.length > 0,
      pisos: pisos
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createTorre,
  updateTorre,
  getTorre,
  deleteTorre,
  verificarTorre,
  getTorresByBeca,
  verificarPisosAsociados,
  getAllTorres
};
