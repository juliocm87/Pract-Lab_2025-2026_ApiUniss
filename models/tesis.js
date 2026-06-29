const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");


const Tesis = sequelize.define(
    "tesis",
    {
    Tema: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'aceptado', 'rechazado'),
        allowNull: false,
        defaultValue: 'pendiente',
        validate: {
            isIn: [['pendiente', 'aceptado', 'rechazado']]
        }
    },
    docenteCI: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = Tesis;

