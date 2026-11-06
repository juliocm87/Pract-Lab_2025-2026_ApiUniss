const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     Turno:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID del turno.
 *         dia_semana:
 *           type: integer
 *           description: Día de la semana (1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado, 7=Domingo).
 *         horario_inicio:
 *           type: string
 *           description: Hora de inicio del turno (formato HH:MM).
 *         horario_fin:
 *           type: string
 *           description: Hora de fin del turno (formato HH:MM).
 *         estado:
 *           type: string
 *           description: Estado del turno (disponible, asignado, cancelado).
 *         asignaturaId:
 *           type: integer
 *           description: ID de la asignatura asociada al turno.
 *         docenteCI:
 *           type: string
 *           description: CI del docente asignado al turno.
 *         horarioId:
 *           type: integer
 *           description: ID del horario al que pertenece el turno.
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
 *         - dia_semana
 *         - horario_inicio
 *         - horario_fin
 *         - estado
 *       example:
 *         dia_semana: 1
 *         horario_inicio: "08:00"
 *         horario_fin: "10:00"
 *         estado: "disponible"
 */

const Turnos = sequelize.define(
    "turnos",
    {
        dia_semana: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 7
            }
        },
        horario_inicio: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        horario_fin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        estado: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'disponible',
            validate: {
                isIn: [['disponible', 'asignado', 'cancelado']]
            }
        },
        asignaturaId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        docenteCI: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        horarioId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = Turnos;
