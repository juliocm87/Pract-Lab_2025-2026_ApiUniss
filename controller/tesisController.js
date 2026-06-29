const AppError = require("../error/AppError");
const Tesis = require("../models/tesis");
const Docente = require("../models/docentes");
const { Op } = require("sequelize");
const Estudiantes = require("../models/estudiantes")

const getTesis = async (offset = 0, limit = 10, searchTerm = '') => {
    try {
        const whereClause = {};
        const includeClause = [
        {
            model: Docente,
            attributes: ["trabajadorId", "nombre_usuario"],
            required: false,
            as: 'tutor'
        },
        {
            model: Estudiantes,
            attributes: ["ci", "nombre", "apellido"],
        }
    ];

    // Si hay un término de búsqueda, agregar condiciones de búsqueda
    if (searchTerm && searchTerm.trim() !== '') {
        whereClause[Op.or] = [
            {
                estado: {
                    [Op.iLike]: `%${searchTerm}%`
                }
            },
            {
                docenteCI: {
                    [Op.iLike]: `%${searchTerm}%`
                }
            }
        ];
    }

        const tesis = await Tesis.findAndCountAll({
        attributes: ["id", "tema", "descripcion", "estado"],
        include: includeClause,
        where: whereClause,
        offset,
        limit
        });
        return tesis;
    } catch (error) {
        throw error;
    }
};

const getAllTesis = async () => {
    try {
        const tesis = await Tesis.findAll({
            attributes: ["id", "tema", "descripcion", "estado"],
            include: [
                {
                    model: Docente,
                    attributes: ["trabajadorId", "nombre_usuario"],
                    required: false,
                    as: 'tutor'
                },
                {
                    model: Estudiantes,
                    attributes: ["ci", "nombre", "apellido"],
                }
            ]
        });
    return tesis;
    } catch (error) {
        throw error;
    }
};

const createTesis = async (datos) => {
    try {
        const {
            tema,
            descripcion,
            docenteCI,
            estudianteCi
        } = datos
        const tesis = await Tesis.create({ 
            tema: tema,
            descripcion: descripcion,
            docenteCI: docenteCI,
            estudianteCi: estudianteCi
        });
        return tesis;
    } catch (error) {
        throw error;
    }
};

const updateTesis = async (id, datos) => {
    try {
        const {
            tema,
            descripcion,
            estudianteCi
        } = datos
        const tesis = await Tesis.update(
            { 
                tema: tema,
                descripcion: descripcion,
                estudianteCi: estudianteCi
            },
            { where: { id } }
        );
        return tesis;
    } catch (error) {
        throw error;
    }
};

const cambiarEstado = async (id, estado) => {
    try {
        const tesis = await Tesis.update(
            { 
                estado: estado
            },
            { where: { id } }
        );
        return tesis;
    } catch (error) {
        throw error;
    }
}

const deleteTesis = async (id) => {
    try {
        const tesis = await Tesis.destroy({ where: { id } });
        return tesis;
    } catch (error) {
        throw error;
    }
};

module.exports = { createTesis, updateTesis, getAllTesis, deleteTesis, getTesis, cambiarEstado };