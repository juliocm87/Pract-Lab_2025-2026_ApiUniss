const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     Torres:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID de la torre.
 *         nombre_torre:
 *           type: string
 *           description: El nombre de la torre.
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
 *         - nombre_torre
 *
 */

const Torres = sequelize.define(
  "torres",
  {
    nombre_torre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
   becaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'becas',
        key: 'id'
      }
    }
  },
  {
    timestamps: true,
    paranoid: true,
    uniqueKeys: {
      nombre_torre_becaId: {
        fields: ['nombre_torre', 'becaId']
      }
    }
  }
);

module.exports = Torres;
