const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     Incidencias:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID de la incidencia.
 *         ci:
 *           type: string
 *           description: Carnet de identidad del estudiante (primer implicado).
 *         todosLosCIs:
 *           type: string
 *           description: Todos los carnets de identidad separados por comas.
 *         tipo:
 *           type: string
 *           description: El tipo de incidencia.
 *         descripcion:
 *           type: string
 *           description: Descripción detallada de la incidencia.
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha en que ocurrió la incidencia.
 *         cantidadImplicados:
 *           type: integer
 *           description: Cantidad de estudiantes implicados en la incidencia.
 *         correoEnviado:
 *           type: boolean
 *           description: Indica si se envió el correo de notificación.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del registro.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización del registro.
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de eliminación (soft delete).
 *       required:
 *         - ci
 *         - tipo
 *         - descripcion
 *         - fecha
 *       description: Al crear una incidencia se enviará un correo de notificación por SMTP.
 */

const Incidencias = sequelize.define(
  "incidencias",
  {
  
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cantidadImplicados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    correoEnviado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Incidencias;