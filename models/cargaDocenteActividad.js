const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");

const CargaDocenteActividad = sequelize.define(
    "cargaDocenteActividad",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        horas: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = CargaDocenteActividad;