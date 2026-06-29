const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");


const Comentarios = sequelize.define(
    "comentarios",
    {
        contenido: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = Comentarios;