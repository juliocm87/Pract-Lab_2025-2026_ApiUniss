const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");


const Talleres = sequelize.define(
    "Talleres",
    {
    nombre: {
        type: DataTypes.ENUM('taller_1', 'taller_2', 'taller_3', 'predefensa', 'defensa'),
        allowNull: false,
        defaultValue: 'taller_1',
        validate: {
            isIn: [['taller_1', 'taller_2', 'taller_3', 'predefensa', 'defensa']]
        }
    },
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = Talleres;