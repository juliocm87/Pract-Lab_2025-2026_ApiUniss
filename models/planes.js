const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");
const Docentes = require("./docentes");
const AsignaturaCarrera = require("./asignaturaCarreras");
/**
 * @swagger
 * components:
 *   schemas:
 *     Plan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID del plan.
 *         descripcion_plan:
 *           type: string
 *           description: La descripción del plan.
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
 *         - nombre_plan
 *       example:
 *         nombre_plan: "matematica_plan"
 */

const Planes = sequelize.define(
    "planes",
    {
    nombre_plan: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    descripcion_plan: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

Planes.hasMany(AsignaturaCarrera);
AsignaturaCarrera.belongsTo(Planes);

module.exports = Planes;