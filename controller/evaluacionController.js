const AppError = require("../error/AppError");
const Evaluaciones = require("../models/evaluaciones");
const Docente = require("../models/docentes");
const { Op } = require("sequelize");
const Comentarios = require("../models/comentarios");
const Tribunales = require("../models/tribunales");
const Tesis = require("../models/tesis");

const getEvaluacionesPorTesis = async (tesisId, jefeId) => {
    try {

        const evaluaciones = await Evaluaciones.findAll({
            where: { tesisId },
            include: [
                {
                    model: Tribunales,
                    as: 'tribunal',
                    where: { jefe: jefeId },
                    required: true,
                    attributes: ["jefe", "secretario", "vocal", "tutor", "oponente"]
                },
                {
                    model: Tesis,
                    as: 'tesis',
                    attributes: ["tema", "descripcion", "docenteCI"]
                }
            ],
            attributes: ["id", "taller", "nota"]
        });

        return evaluaciones;
    } catch (error) {
        throw error;
    }
};

const getEvaluacion = async (offset = 0, limit = 10, searchTerm = '') => {
    try {
        const whereClause = {};
        const includeClause = [
        {
            model: Tribunales,
            attributes: [
                "jefe", 
                "secretario", 
                "vocal",
                "tutor",
                "oponente"
            ],
            required: false,
            as: 'tribunal'
        },
        {
            model: Tesis,
            attributes: ["tema", "descripcion", "docenteCI"],
            
        }
    ];

    // Si hay un término de búsqueda, agregar condiciones de búsqueda
    if (searchTerm && searchTerm.trim() !== '') {
        whereClause[Op.or] = [
            {
                tesisId: {
                    [Op.iLike]: `%${searchTerm}%`
                }
            },
            {
                tribunalId: {
                    [Op.iLike]: `%${searchTerm}%`
                }
            }
        ];
    }

        const evaluaciones = await Evaluaciones.findAndCountAll({
        attributes: ["id", "taller", "nota"],
        include: includeClause,
        where: whereClause,
        offset,
        limit
        });
        return evaluaciones;
    } catch (error) {
        throw error;
    }
};

const getAllEvaluacion = async () => {
    try {
        const evaluaciones = await Evaluaciones.findAll({
            attributes: ["id", "taller", "nota"],
            include: [
                {
                    model: Tribunales,
                    attributes: [
                        "jefe", 
                        "secretario", 
                        "vocal",
                        "tutor",
                        "oponente"
                    ],
                    required: false,
                    as: 'tribunal'
                },
                {
                    model: Tesis,
                    as: 'tesis',
                    attributes: ["tema", "descripcion", "docenteCI"],
                }
            ]
        });
    return evaluaciones;
    } catch (error) {
        throw error;
    }
};

const createEvaluacion = async (jefeId, datos) => {
    try {
        const {
            tesisId,
            tribunalId,
            taller,
        } = datos

        const tesis = await Tesis.findByPk(tesisId);
        if (!tesis) {
            throw new AppError("La tesis no existe", 404);
        }

        // Verificar que el tribunal exista
        const tribunal = await Tribunales.findByPk(tribunalId);
        if (!tribunal) {
            throw new AppError("El tribunal no existe", 404);
        }

        // Verificar que no haya una evaluación duplicada para esta tesis y taller
        const existeEvaluacion = await Evaluaciones.findOne({
            where: { tesisId, taller }
        });
        if (existeEvaluacion) {
            throw new AppError(`Ya existe una evaluación para esta tesis en el taller "${taller}"`, 400);
        }

        const tribunal = await Tribunales.findByPk(tribunalId)
        if (jefeId !== tribunal.jefe){
            throw new AppError("Solo el jefe del tribunal puede dar una evaluación "+ error.message, 401)
        }
        const evaluacion = await Evaluaciones.create({ 
            tesisId: tesisId,
            tribunalId: tribunalId,
            taller: taller,
            nota: null
        });
        return evaluacion;
    } catch (error) {
        throw error;
    }
};

const updateEvaluacion = async (id, jefeId, nota) => {
    try {
        const buscarEvaluacion = await Evaluaciones.findByPk(id, {
            include: [
                {
                    model: Tribunales,
                    as: 'tribunal'
                },
                {
                    model: Tesis,
                    as: 'tesis'
                }
            ]
        })
        if(!buscarEvaluacion){
            throw new AppError("La evaluación no existe"+ error.message, 404)
        }
        if(jefeId !== buscarEvaluacion.tribunale.jefe){
            throw new AppError("Solo el jefe del tribunal puede actualizar una evaluación "+ error.message, 401)
        }
        const evaluacion = await Evaluaciones.update(
            { nota},
            { where: { id } }
        );
        return evaluacion;
    } catch (error) {
        throw error;
    }
};

const deleteEvaluacion = async (id) => {
    try {
        const evaluacion = await Evaluaciones.destroy({ where: { id } });
        return evaluacion;
    } catch (error) {
        throw error;
    }
};

module.exports = { createEvaluacion, updateEvaluacion, getAllEvaluacion, deleteEvaluacion, getEvaluacion, getEvaluacionesPorTesis };