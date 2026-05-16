const AppError = require("../error/AppError");
const Beca = require("../models/becas");
const Torres = require("../models/torres");
const Trabajador = require("../models/trabajadores");
const Cuarto = require("../models/cuartos");
const Piso = require("../models/pisos");
const Estudiantes = require("../models/estudiantes");
const { Op } = require("sequelize");


const getBeca = async (offset = 0, limit = 10, searchTerm = '') => {
  try {
    const whereClause = {};
    const includeClause = [
      {
        model: Trabajador,
        attributes: ["ci", "nombre", "apellido"],
        required: false,
        as: 'becaJefe'
      },
    ];

    // Si hay un término de búsqueda, agregar condiciones de búsqueda
    if (searchTerm && searchTerm.trim() !== '') {
      whereClause[Op.or] = [
        {
          nombre_beca: {
            [Op.iLike]: `%${searchTerm}%`
          }
        },
        {
          '$becaJefe.nombre$': {
            [Op.iLike]: `%${searchTerm}%`
          }
        },
        {
          '$becaJefe.apellido$': {
            [Op.iLike]: `%${searchTerm}%`
          }
        }
      ];
    }

    const becas = await Beca.findAndCountAll({
      attributes: ["id", "nombre_beca", "trabajadorId"],
      include: includeClause,
      where: whereClause,
      offset,
      limit
    });
    return becas;
  } catch (error) {
    throw error;
  }
};

const getAllBecas = async () => {
  try {
    const becas = await Beca.findAll({
      attributes: ["id", "nombre_beca", "trabajadorId"],
      include: [
        {
          model: Trabajador,
          attributes: ["ci", "nombre", "apellido"],
          required: false,
          as: 'becaJefe'
        },
      ]
    });
    return becas;
  } catch (error) {
    throw error;
  }
};

const createBeca = async (nombre_beca) => {
  try {
    const beca = await Beca.create({ nombre_beca});
    return beca;
  } catch (error) {
    throw error;
  }
};

const updateBeca = async (id, nombre_beca) => {
  try {
    const beca = await Beca.update(
      { nombre_beca},
      { where: { id } }
    );
    return beca;
  } catch (error) {
    throw error;
  }
};

const deleteBeca = async (id) => {
  try {
    // Verificar si hay pisos asociados a la beca
    const torresAsociados = await Torres.count({ where: { becaId: id } });
    if (torresAsociados > 0) {
      throw new AppError(
        "No se puede eliminar la beca cuando esta tiene datos dentro.",
        400
      );
    }

    const beca = await Beca.destroy({ where: { id } });
    return beca;
  } catch (error) {
    throw error;
  }
};

const getCapacidadBecas = async () => {
  try {
    // Obtener todas las becas
    const becas = await Beca.findAll({
      attributes: ["id", "nombre_beca"],
      include: [
        {
          model: Torres,
          attributes: ["id"],
          include: [
            {
              model: require("../models/pisos"),
              attributes: ["id"],
              include: [
                {
                  model: Cuarto,
                  attributes: ["id", "capacidad_maxima"],
                },
              ],
            },
          ],
        },
      ],
    });

    // Para cada beca, calcular la capacidad total y ocupada
    const resultado = await Promise.all(
      becas.map(async (beca) => {
        let capacidad_total = 0;
        let capacidad_ocupada = 0;
        let cuartosIds = [];

        // Recorrer torres, pisos y cuartos
        beca.torres.forEach((torre) => {
          torre.pisos.forEach((piso) => {
            piso.cuartos.forEach((cuarto) => {
              capacidad_total += cuarto.capacidad_maxima;
              cuartosIds.push(cuarto.id);
            });
          });
        });

        // Contar estudiantes en los cuartos
        const estudiantesCount = await Estudiantes.count({
          where: { cuartoId: cuartosIds },
        });
        // Contar trabajadores en los cuartos
        const trabajadoresCount = await Trabajador.count({
          where: { cuartoId: cuartosIds },
        });
        capacidad_ocupada = estudiantesCount + trabajadoresCount;

        return {
          nombre_beca: beca.nombre_beca,
          capacidad_disponible: capacidad_total - capacidad_ocupada,
          capacidad_ocupada: capacidad_ocupada,
        };
      })
    );
    return resultado;
  } catch (error) {
    throw error;
  }
};

const asignarJefeBeca = async (becaId, trabajadorId) => {
  try {
    // Verificar que la beca existe
    const beca = await Beca.findByPk(becaId);
    if (!beca) {
      throw new AppError("Beca no encontrada", 404);
    }

    // Verificar que el trabajador existe
    const trabajador = await Trabajador.findByPk(trabajadorId);
    if (!trabajador) {
      throw new AppError("Trabajador no encontrado", 404);
    }

    // Verificar que el trabajador no esté ya asignado como jefe de otra beca
    const becaExistente = await Beca.findOne({ where: { trabajadorId } });
    if (becaExistente && becaExistente.id !== parseInt(becaId)) {
      throw new AppError("El trabajador ya está asignado como jefe de otra beca", 400);
    }

    // Asignar el trabajador como jefe de la beca
    await Beca.update(
      { trabajadorId },
      { where: { id: becaId } }
    );

    // Retornar la beca actualizada con los datos del jefe
    const becaActualizada = await Beca.findByPk(becaId, {
      include: [
        {
          model: Trabajador,
          attributes: ["ci", "nombre", "apellido"],
          required: false,
          as: 'becaJefe'
        },
      ]
    });

    return becaActualizada;
  } catch (error) {
    throw error;
  }
};

module.exports = { createBeca, updateBeca, getBeca, deleteBeca, getAllBecas, getCapacidadBecas, asignarJefeBeca };
