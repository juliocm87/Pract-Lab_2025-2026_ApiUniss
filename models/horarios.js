const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     Horario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID del horario.
 *         numero_semana:
 *           type: integer
 *           description: Número de semana (1-17).
 *         fecha_inicio_semana:
 *           type: string
 *           format: date
 *           description: Fecha de inicio de la semana.
 *         fecha_fin_semana:
 *           type: string
 *           format: date
 *           description: Fecha de fin de la semana.
 *         hora_inicio:
 *           type: string
 *           description: Hora de inicio del horario (formato HH:MM).
 *         horario_fin:
 *           type: string
 *           description: Hora de fin del horario (formato HH:MM).
 *         cursoId:
 *           type: integer
 *           description: ID del curso (año académico).
 *         carreraId:
 *           type: integer
 *           description: ID de la carrera.
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
 *         - numero_semana
 *         - fecha_inicio_semana
 *         - fecha_fin_semana
 *       example:
 *         numero_semana: 1
 *         fecha_inicio_semana: "2025-02-16"
 *         fecha_fin_semana: "2025-02-20"
 *         hora_inicio: "08:00"
 *         horario_fin: "18:00"
 */

const Horarios = sequelize.define(
  "horarios",
  {
    numero_semana: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 17
      }
    },
    fecha_inicio_semana: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_fin_semana: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    hora_inicio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    horario_fin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cursoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    carreraId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Horarios;