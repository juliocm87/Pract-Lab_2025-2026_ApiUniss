const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     Estudiantes:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID del estudiante.
 *         ci:
 *           type: string
 *           description: La cédula de identidad del estudiante.
 *           example: "1234567890"
 *         cuartoId:
 *           type: integer
 *           description: ID del cuarto asignado al estudiante.
 *         facultadId:
 *           type: integer
 *           description: ID de la facultad a la que pertenece el estudiante.
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
 *         - ci
 *         - facultadId
 */
const Estudiantes = sequelize.define(
  "estudiantes",
  {
    ci: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,

    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facultad: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    carrera: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    anno_academico: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prematricula: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Estudiantes;
