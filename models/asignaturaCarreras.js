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
        planId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "planes",
                key: "id"
            },
        },
        horas_clase: {
            type: DataTypes.INTEGER,
            allowNull: false
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