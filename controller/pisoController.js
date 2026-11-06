const Piso = require("../models/pisos");
const Torre = require("../models/torres");
const Beca = require("../models/becas");
const Cuarto = require("../models/cuartos");
const Trabajador = require("../models/trabajadores");
const AppError = require("../error/AppError");
const { Op } = require("sequelize");

const getPiso = async () => {
  try {
    const pisos = await Piso.findAll({
      attributes: ["id", "numero_piso", "torreId", "trabajadorId"],
      include: [
        {
          model: Torre,
          attributes: ["nombre_torre", "becaId"],
          include: [
            {
              model: Beca,
              attributes: ["nombre_beca"]
            }
          ]
        },
        {
          model: Trabajador,
          as: "trabajadorSupervisor",

          attributes: ["ci", "nombre", "apellido"],
          required: false
        }
      ],
      order: [
        ['numero_piso', 'ASC']
      ]
    });

    console.log('Pisos encontrados:', JSON.stringify(pisos, null, 2));
    return pisos;
  } catch (error) {
    console.error('Error en getPiso:', error);
    throw error;
  }
};

const getAllPisos = async () => {
  try {
    const pisos = await Piso.findAll({
      attributes: ["id", "numero_piso", "torreId", "trabajadorId"],
      include: [
        {
          model: Torre,
          attributes: ["nombre_torre", "becaId"],
          include: [
            {
              model: Beca,
              attributes: ["nombre_beca"]
            }
          ]
        },
        {
          model: Trabajador,
          as: "trabajadorSupervisor",
          attributes: ["ci", "nombre", "apellido"],
          required: false
        }
      ],
      order: [
        ['numero_piso', 'ASC']
      ]
    });
    return pisos;
  } catch (error) {
    throw error;
  }
};

const getPisoPaginated = async (offset = 0, limit = 10, searchTerm = '') => {
  try {
    const whereClause = {};
    const includeClause = [
      {
        model: Torre,
        attributes: ["nombre_torre", "becaId"],
        include: [
          {
            model: Beca,
            attributes: ["nombre_beca"]
          }
        ]
      },
      {
        model: Trabajador,
        as: "trabajadorSupervisor",
        attributes: ["ci", "nombre", "apellido"],
        required: false
      }
    ];

    // Si hay un término de búsqueda, agregar condiciones de búsqueda
    if (searchTerm && searchTerm.trim() !== '') {
      whereClause[Op.or] = [
        {
          numero_piso: {
            [Op.iLike]: `%${searchTerm}%`
          }
        },
        {
          '$torre.nombre_torre$': {
            [Op.iLike]: `%${searchTerm}%`
          }
        },
        {
          '$torre.beca.nombre_beca$': {
            [Op.iLike]: `%${searchTerm}%`
          }
        },
        {
          '$trabajadorSupervisor.nombre$': {
            [Op.iLike]: `%${searchTerm}%`
          }
        },
        {
          '$trabajadorSupervisor.apellido$': {
            [Op.iLike]: `%${searchTerm}%`
          }
        }
      ];
    }

    const pisos = await Piso.findAndCountAll({
      attributes: ["id", "numero_piso", "torreId", "trabajadorId"],
      where: whereClause,
      include: includeClause,
      order: [
        ['numero_piso', 'ASC']
      ],
      offset,
      limit
    });
    return pisos;
  } catch (error) {
    throw error;
  }
};

const getPisosByTorre = async (torreId) => {
  try {
    const pisos = await Piso.findAll({
      where: { torreId },
      attributes: ["id", "numero_piso", "torreId", "trabajadorId"],
      include: [
        {
          model: Torre,
          attributes: ["nombre_torre", "becaId"],
          include: [
            {
              model: Beca,
              attributes: ["nombre_beca"]
            }
          ]
        },
        {
          model: Trabajador,
          as: "trabajadorSupervisor",
          attributes: ["ci", "nombre", "apellido"],
          required: false
        }
      ],
      order: [
        ['numero_piso', 'ASC']
      ]
    });
    return pisos;
  } catch (error) {
    throw error;
  }
};

const verificarPisoExistente = async (numero_piso, torreId, id = null) => {
  const whereClause = {
    numero_piso,
    torreId
  };

  if (id) {
    whereClause.id = { [Op.ne]: id }; // Excluir el piso actual en caso de actualización
  }

  const pisoExistente = await Piso.findOne({
    where: whereClause,
    include: [
      {
        model: Torre,
        include: [
          {
            model: Beca,
          },
        ],
      },
    ],
  });

  return pisoExistente;
};

const createPiso = async (numero_piso, torreId) => {
  try {
    // Verificar si ya existe un piso con el mismo número en la misma torre
    const pisoExistente = await verificarPisoExistente(numero_piso, torreId);
    if (pisoExistente) {
      throw new AppError(
        "Ya existe un piso con el mismo número en esta torre.",
        400
      );
    }

    const piso = await Piso.create({ numero_piso, torreId });
    return piso;
  } catch (error) {
    throw error;
  }
};

const updatePiso = async (id, numero_piso, torreId) => {
  try {
    // Verificar si ya existe un piso con el mismo número en la misma torre
    const pisoExistente = await verificarPisoExistente(numero_piso, torreId, id);
    if (pisoExistente) {
      throw new AppError(
        "Ya existe un piso con el mismo número en esta torre.",
        400
      );
    }

    const [updated] = await Piso.update(
      { numero_piso, torreId },
      { where: { id } }
    );

    if (!updated) {
      throw new AppError("No se encontró el piso a actualizar.", 404);
    }

    const pisoActualizado = await Piso.findByPk(id, {
      include: [
        {
          model: Torre,
          include: [
            {
              model: Beca,
            },
          ],
        },
      ],
    });

    return pisoActualizado;
  } catch (error) {
    throw error;
  }
};

const deletePiso = async (id) => {
  try {
    // Verificar si hay cuartos asociados al piso
    const cuartosAsociados = await Cuarto.count({ where: { pisoId: id } });
    if (cuartosAsociados > 0) {
      throw new AppError(
        "No se puede eliminar el piso cuando tiene cuartos asociados.",
        400
      );
    }
    const piso = await Piso.destroy({ where: { id } });
    return piso;
  } catch (error) {
    throw error;
  }
};

const verificarPiso = async (numero_piso, torreId) => {
  try {
    const pisoExistente = await Piso.findOne({
      where: {
        numero_piso,
        torreId
      }
    });
    return pisoExistente ? true : false;
  } catch (error) {
    throw error;
  }
};

module.exports = { createPiso, updatePiso, getPiso, deletePiso, verificarPiso, getAllPisos, getPisoPaginated, getPisosByTorre };
