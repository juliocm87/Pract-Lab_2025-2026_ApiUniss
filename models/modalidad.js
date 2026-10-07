const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");


const Modalidades = sequelize.define(
    "modalidades",
    {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = Modalidades;