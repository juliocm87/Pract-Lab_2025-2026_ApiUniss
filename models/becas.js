const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");

const Torres = require("./torres");

/**
 * @swagger
 * components:
 *   schemas:
 *     Beca:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID de la beca.
 *         nombre_beca:
 *           type: string
 *           description: El nombre de la beca.
 *         trabajadorId:
 *           type: integer
 *           description: ID del trabajador que es jefe de la beca.
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
 *         - nombre_beca
 *       example:
 *         nombre_beca: "Beca de Excelencia"
 */
const Becas = sequelize.define(
  "becas",
  {
    nombre_beca: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    trabajadorId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    }
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

Becas.hasMany(Torres, {
  foreignKey: "becaId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Torres.belongsTo(Becas, {
  foreignKey: "becaId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = Becas;
