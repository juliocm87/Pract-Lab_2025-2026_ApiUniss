const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     Asignatura:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID de la asignatura.
 *         nombre_asignatura:
 *           type: string
 *           description: El nombre de la asignatura.
 *         facultad:
 *           type: string
 *           description: facultad en la que se imparte la asignatura.
 *         semestre:
 *           type: integer
 *           description: semestre en el que se imparte la asignatura.
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
 *         - nombre_asignatura
 *       example:
 *         nombre_asignatura: "Cálculo"
 */

const Asignaturas = sequelize.define(
    "asignaturas",
    {
    nombre_asignatura: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    facultad: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    semestre: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
    },
    {
        timestamps: true,
        paranoid: true,
    }
);



module.exports = Asignaturas;