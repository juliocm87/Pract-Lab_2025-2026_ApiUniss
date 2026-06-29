const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");

const CargaDocente = sequelize.define(
    "cargaDocente",
    {
        docenteCI: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        anno: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        mes: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        estado: {
            type: DataTypes.ENUM('pendiente', 'aceptado', 'rechazado'),
            allowNull: false,
            defaultValue: 'pendiente',
            validate: {
                isIn: [['pendiente', 'aceptado', 'rechazado']]
            }
        },
        modalidad: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        total_horas: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        horas_sobrecarga: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = CargaDocente;