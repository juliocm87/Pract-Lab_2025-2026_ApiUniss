const AppError = require("../error/AppError");
const Comentarios = require("../models/comentarios");
const Docente = require("../models/docentes");
const { Op } = require("sequelize");
const Evaluaciones = require("../models/evaluaciones");
const Trabajadores = require("../models/trabajadores");

const getComentario = async (offset = 0, limit = 10, searchTerm = '') => {
    try {
        const whereClause = {};
        const includeClause = [
        {
            model: Docente,
            attributes: ["trabajadorId"],
            include: [
                {
                    model: Trabajadores,
                    attributes: ["nombre", "apellido", "rol"]
                }
            ],
            require: false,
            as: 'responsable'
        },
            {
            model: Evaluaciones,
            attributes: ["tesisId", "tribunalId", "taller"],
            required: false,
            as: 'evaluación'
        }
    ];

    // Si hay un término de búsqueda, agregar condiciones de búsqueda
    if (searchTerm && searchTerm.trim() !== '') {
        whereClause[Op.or] = [
            {
                docenteId: {
                    [Op.iLike]: `%${searchTerm}%`
                }
            },
            {
                evaluacionId: {
                    [Op.iLike]: `%${searchTerm}%`
                }
            }
        ];
    }

        const comentarios = await Comentarios.findAndCountAll({
        attributes: ["id", "docenteId", "evaluacionId"],
        include: includeClause,
        where: whereClause,
        offset,
        limit
        });
        return comentarios;
    } catch (error) {
        throw error;
    }
};

const getAllComentarios = async () => {
    try {
        const comentarios = await Comentarios.findAll({
            attributes: ["id", "docenteId", "evaluacionId"],
            include: [
                {
                    model: Docente,
                    attributes: ["trabajadorId"],
                    include: [
                        {
                            model: Trabajadores,
                            attributes: ["nombre", "apellido", "rol"]
                        }
                    ],
                    require: false,
                    as: 'responsable'
                },
                {
                    model: Evaluaciones,
                    attributes: ["tesisId", "tribunalId", "taller"],
                    required: false,
                    as: 'evaluación'
                }
            ]
        });
    return comentarios;
    } catch (error) {
        throw error;
    }
};

const createComentario = async (datos) => {
    try {
        const {
            docenteId,
            evaluacionId,
            contenido
        } = datos
        const comentario = await Comentarios.create({ 
            docenteId: docenteId,
            evaluacionId: evaluacionId,
            contenido: contenido
        });
        return comentario;
    } catch (error) {
        throw error;
    }
};

const updateComentario = async (id, contenido) => {
    try {
        const comentario = await Comentarios.update(
            { contenido},
            { where: { id } }
        );
        return comentario;
    } catch (error) {
        throw error;
    }
};

const deleteComentario = async (id) => {
    try {
        const comentario = await Comentarios.destroy({ where: { id } });
        return comentario;
    } catch (error) {
        throw error;
    }
};

module.exports = { createComentario, updateComentario, getComentario, deleteComentario, getAllComentarios};