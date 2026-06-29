const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");


/*const Evaluaciones = sequelize.define(
    "Evaluaciones",
    {
    tesisId: {
        type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "tesis",
                key: "id"
            },
    },
    tallerId: {
        type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "taller",
                key: "id"
            },
    },
    tribunalId: {
        type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "tribunal",
                key: "id"
            },
    },
    nota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
                min: 2,
                max: 5
            }
    },
    },
    {
        timestamps: true,
        paranoid: true,
    }
);*/
const Evaluaciones = sequelize.define(
    "Evaluaciones",
    {
    tesisId: {
        type: DataTypes.INTEGER,
            allowNull: false,
            unique: 'compositeIndex_tesis_taller'
    },
    tribunalId: {
        type: DataTypes.INTEGER,
            allowNull: false,
    },
    taller: {
        type: DataTypes.ENUM('taller_1', 'taller_2', 'taller_3', 'predefensa', 'defensa'),
        allowNull: false,
        unique: 'compositeIndex_tesis_taller',
        defaultValue: 'taller_1',
        validate: {
            isIn: [['taller_1', 'taller_2', 'taller_3', 'predefensa', 'defensa']]
        },
    },
    nota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
                min: 2,
                max: 5
            }
    },
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = Evaluaciones;