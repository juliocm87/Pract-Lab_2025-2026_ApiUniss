/*
nombre carrera
facultad
*/
//relacion 1-1 con docente
const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");
const docente = require("./docentes");
const Docentes = require("./docentes");
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
        type: DataTypes.INTEGER,
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

// Relación con Docentes (Uno a Uno) - Carrera tiene un Docente como guia
Docentes.hasOne(Carreras, {
    foreignKey: "docenteId",
    as: "guia",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

Carreras.belongsTo(Docentes, {
    foreignKey: "docenteId",
    as: "guia",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

module.exports = Carreras;