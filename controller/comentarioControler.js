const AppError = require("../error/AppError");
const Comentarios = require("../models/comentarios");
const Docente = require("../models/docentes");
const { Op } = require("sequelize");
const Evaluaciones = require("../models/evaluaciones");
const Trabajadores = require("../models/trabajadores");

const getComentariosPorEvaluacion = async (evaluacionId) => {
    try {
        const comentarios = await Comentarios.findAll({
            where: { EvaluacioneId: evaluacionId },
            attributes: ["id", "docenteId", "EvaluacioneId", "contenido", "createdAt", "updatedAt"],
            include: [
                {
                    model: Docentes,
                    attributes: ["trabajadorId"],
                    include: [
                        {
                            model: Trabajadores,
                            as: 'Trabajador',
                            attributes: ["nombre", "apellido", "rol"]
                        }
                    ],
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        return comentarios;
    } catch (error) {
        throw error;
    }
};


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
                    as: 'Trabajador',
                    attributes: ["nombre", "apellido", "rol"]
                }
            ],
            require: false,
        },
            {
            model: Evaluaciones,
            attributes: ["tesisId", "tribunalId", "taller"],
            required: false,
        }
    ];
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
        attributes: ["id", "docenteId", "evaluacionId", "contenido"],
        include: includeClause,
        where: whereClause,
        offset,
        limit,
        order: [['createdAt', 'DESC']]
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
                            as: 'Trabajador',
                            attributes: ["nombre", "apellido", "rol"]
                        }
                    ],
                    require: false,
                },
                {
                    model: Evaluaciones,
                    attributes: ["tesisId", "tribunalId", "taller"],
                    required: false,
                }
            ],
            order: [['createdAt', 'DESC']]
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
        const evaluacion = await Evaluaciones.findByPk(EvaluacioneId, {
            include: [{ model: Tribunales, as: 'tribunal' }]
        });
        if (!evaluacion) {
            throw new AppError("La evaluación no existe", 404);
        }
        const esMiembro = (
            evaluacion.tribunal.jefe === docenteId ||
            evaluacion.tribunal.secretario === docenteId ||
            evaluacion.tribunal.vocal === docenteId ||
            evaluacion.tribunal.tutor === docenteId ||
            evaluacion.tribunal.oponente === docenteId
        );
        if (!esMiembro) {
            throw new AppError("No tienes permiso para comentar en esta evaluación", 403);
        }

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

const updateComentario = async (comentarioId, docenteId, contenido) => {
    try {
        const comentario = await Comentarios.findByPk(comentarioId);
        if (!comentario) {
            throw new AppError("Comentario no encontrado", 404);
        }
        if (comentario.docenteId !== docenteId) {
            throw new AppError("Solo el autor puede editar este comentario", 403);
        }
        await comentario.update(
            { contenido},
        );
        return comentario;
    } catch (error) {
        throw error;
    }
};

const deleteComentario = async (docenteId, comentarioId) => {
    try {
        const comentario = await Comentarios.findByPk(comentarioId);
        if (!comentario) {
            throw new AppError("Comentario no encontrado", 404);
        }
        if (comentario.docenteId !== docenteId) {
            throw new AppError("Solo el autor puede eliminar este comentario", 403);
        }
        await comentario.destroy();
        return true;
    } catch (error) {
        throw error;
    }
};

module.exports = { createComentario, updateComentario, getComentario, deleteComentario, getAllComentarios, getComentariosPorEvaluacion};