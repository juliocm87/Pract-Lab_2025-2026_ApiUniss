const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");


const Actividades = sequelize.define(
    "actividades",
    {
        numero: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        descripcion: {
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

module.exports = Actividades;