const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     Curso:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID del curso (año académico).
 *         nombre_curso:
 *           type: string
 *           description: El nombre del curso (ej: "2025-2026").
 *         fecha_inicio:
 *           type: string
 *           format: date
 *           description: Fecha de inicio del curso (ej: septiembre 2025).
 *         fecha_fin:
 *           type: string
 *           format: date
 *           description: Fecha de fin del curso (ej: julio 2026).
 *         estado:
 *           type: string
 *           description: Estado del curso (activo, inactivo, finalizado).
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
 *         - nombre_curso
 *         - fecha_inicio
 *         - fecha_fin
 *       example:
 *         nombre_curso: "2025-2026"
 *         fecha_inicio: "2025-09-01"
 *         fecha_fin: "2026-07-31"
 *         estado: "activo"
 */

const Cursos = sequelize.define(
    "cursos",
    {
        nombre_curso: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        fecha_inicio: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fecha_fin: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        estado: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'activo',
        }
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = Cursos;
