const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");

const Cuartos = require("./cuartos");
const Trabajadores = require("./trabajadores");

/**
 * @swagger
 * components:
 *   schemas:
 *     Pisos:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID del piso.
 *         numero_piso:
 *           type: integer
 *           description: El número del piso.
 *         trabajadorId:
 *           type: string
 *           description: CI del trabajador que supervisa el piso.
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
 *         - numero_piso
 *       example:
 *         numero_piso: 1
 */

const Pisos = sequelize.define(
  "pisos",
  {
    numero_piso: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    trabajadorId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'trabajadores',
        key: 'ci'
      }
    },
    torreId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'torres',
        key: 'id'
      }
    }
  },
  {
    timestamps: true,
    paranoid: true,
    uniqueKeys: {
      numero_piso_torreId: {
        fields: ['numero_piso', 'torreId']
      }
    }
  }
);

// Relación con Cuartos (Uno a Muchos)
Pisos.hasMany(Cuartos, {
  foreignKey: "pisoId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Cuartos.belongsTo(Pisos, {
  foreignKey: "pisoId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});



module.exports = Pisos;
