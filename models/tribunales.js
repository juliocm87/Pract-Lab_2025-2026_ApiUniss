const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");


const Tribunales = sequelize.define(
    "tribunales",
    {
    jefe: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'docentes',
            key: 'trabajadorId'
        }
    },
    secretario: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'docentes',
            key: 'trabajadorId'
        }
    },
    vocal: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'docentes',
            key: 'trabajadorId'
        }
    },
    tutor: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'docentes',
            key: 'trabajadorId'
        }
    },
    oponente: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'docentes',
            key: 'trabajadorId'
        }
    },
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = Tribunales;