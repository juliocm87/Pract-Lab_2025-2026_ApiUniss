const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");

const AsignaturaCarrera = sequelize.define(
    "asignatura_carrera",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        horas_clase: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        hora_inicio: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        horario_fin: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        anno_academico: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
        
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = AsignaturaCarrera;