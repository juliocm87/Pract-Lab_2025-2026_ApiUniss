const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");


/**
 * @swagger
 * components:
 *   schemas:
 *     Carrera:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID de la carrera.
 *         nombre_carrera:
 *           type: string
 *           description: El nombre de la carrera.
 *         docenteId:
 *           type: integer
 *           descripcion: El id del docente que es guia de la carrera.
 *         facultad:
 *           type: string
 *           description: facultad en la que se imparte la carrera.
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
 *         - nombre_carrera
 *       example:
 *         nombre_carrera: "Ing informatica"
 */

const Carreras = sequelize.define(
    "carreras",
    {
    nombre_carrera: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    docenteId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    facultad: {
        type: DataTypes.STRING,
        allowNull: true,
    }
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = Carreras;