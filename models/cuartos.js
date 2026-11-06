const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     Cuartos:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID del cuarto.
 *         numero_cuarto:
 *           type: integer
 *           description: El número del cuarto.
 *           example: 101
 *         capacidad_maxima:
 *           type: integer
 *           description: La capacidad máxima del cuarto.
 *           example: 2
 *         genero:
 *           type: string
 *           enum: [masculino, femenino]
 *           description: El género asignado al cuarto.
 *           example: "masculino"
 *         pisoId:
 *           type: integer
 *           description: ID del piso al que pertenece el cuarto.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización.
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de eliminación (soft delete).
 *       required:
 *         - numero_cuarto
 *         - capacidad_maxima
 *         - genero
 *         - pisoId
 */

const Cuartos = sequelize.define(
  "cuartos",
  {
    numero_cuarto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    capacidad_maxima: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    genero: {
      type: DataTypes.ENUM('masculino', 'femenino'),
      allowNull: false,
      defaultValue: 'masculino',
      validate: {
        isIn: [['masculino', 'femenino']]
      }
    },
    pisoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pisos',
        key: 'id'
      }
    },
   
    
  },
  {
    timestamps: true,
    paranoid: true,
    uniqueKeys: {
      numero_cuarto_pisoId: {
        fields: ['numero_cuarto', 'pisoId']
      }
    }
  }
);

module.exports = Cuartos;
