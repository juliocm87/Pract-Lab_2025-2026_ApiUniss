const AppError = require("../error/AppError");
const Tribunales = require("../models/tribunales");
const Docente = require("../models/docentes");
const { Op } = require("sequelize");
const Trabajadores = require("../models/trabajadores");

const getTribunal = async (offset = 0, limit = 10, searchTerm = '') => {
    try {
        const whereClause = {};
        const includeClause = [
        {
            model: Docente,
            include: [
                {
                    model: Trabajadores,
                    attributes: ["ci", "nombre", "apellido", "rol"]
                }
            ],
            required: false,
        }
    ];

    // Si hay un término de búsqueda, agregar condiciones de búsqueda
    /*   whereClause[Op.or] = [
            {
                nombre_carrera: {
                    [Op.iLike]: `%${searchTerm}%`
                }
            },
            {
                '$guia.nombre_usuario$': {
                    [Op.iLike]: `%${searchTerm}%`
                }
            }
        ];
    }*/

        const tribunales = await Tribunales.findAndCountAll({
        attributes: ["id", "jefe", "secretario", "vocal", "tutor", "oponente"],
        include: includeClause,
        where: whereClause,
        offset,
        limit
        });
        return tribunales;
    } catch (error) {
        throw error;
    }
};

const getAllTribunales = async () => {
    try {
        const tribunales = await Tribunales.findAll({
            attributes: ["id", "jefe", "secretario", "vocal", "tutor", "oponente"],
            include: [
                {
                    model: Docente,
                    include: [
                        {
                            model: Trabajadores,
                            attributes: ["ci", "nombre", "apellido", "rol"]
                        }
                    ],
                required: false,
                }
            ]
        });
    return tribunales;
    } catch (error) {
        throw error;
    }
};

const createTribunal = async (datos) => {
    try {
        const {
            jefe, 
            secretario, 
            vocal,
            tutor,
            oponente
        } = datos
        const tribunal = await Tribunales.create({ 
            jefe: jefe, 
            secretario: secretario,
            vocal: vocal,
            tutor: tutor,
            oponente: oponente
        });
        return tribunal;
    } catch (error) {
        throw error;
    }
};

const updateTribunal = async (id, datos) => {
    try {
        const {
            jefe, 
            secretario, 
            vocal,
            tutor,
            oponente
        } = datos
        const tribunal = await Tribunales.update(
            { 
                jefe: jefe, 
                secretario: secretario,
                vocal: vocal,
                tutor: tutor,
                oponente: oponente
            },
            { where: { id } }
        );
        return tribunal;
    } catch (error) {
        throw error;
    }
};

const deleteTribunal = async (id) => {
    try {
        const tribunal = await Tribunales.destroy({ where: { id } });
        return tribunal;
    } catch (error) {
        throw error;
    }
};

module.exports = { createTribunal, updateTribunal, getAllTribunales, deleteTribunal, getTribunal };