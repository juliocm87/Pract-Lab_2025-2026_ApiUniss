const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");


/**
 * @swagger
 * components:
 *   schemas:
 *     Docentes:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID del docente.
 *         facultadId:
 *           type: string
 *           description: ID de la facultad a la que pertenece el docente.
 *         nombre_usuario:
 *           type: string
 *           description: Nombre de usuario del docente en el sistema.
 *         trabajadorId:
 *           type: integer
 *           description: ID del trabajador asociado al docente.
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
 *         - facultadId
 *         - trabajadorId
 *         - nombre_usuario
 */

const Docentes = sequelize.define(
  "docentes",
  {
    trabajadorId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      references: {
        model: 'trabajadores',
        key: 'ci'
      }
    },
    facultadId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cargo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Docentes; 