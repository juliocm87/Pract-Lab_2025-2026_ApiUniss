const AppError = require("../error/AppError");
const Asignaturas = require("../models/asignaturas");
const Carrera = require("../models/carreras");
const Docente = require("../models/docentes");
const { Op } = require("sequelize");
const sigenu = require("../services/sigenu.service")

const getCarrera = async (offset = 0, limit = 10, searchTerm = '') => {
    try {
        const whereClause = {};
        const includeClause = [
        {
            model: Docente,
            attributes: ["trabajadorId", "nombre_usuario"],
            required: false,
            as: 'guia'
        },
        {
            model: Asignaturas,
            attributes: ["nombre_asignatura"],
            through: {
                attributes: ["id", "horas_clase", "anno_academico"]
            }
        }
    ];

    // Si hay un término de búsqueda, agregar condiciones de búsqueda
    if (searchTerm && searchTerm.trim() !== '') {
        whereClause[Op.or] = [
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
    }

        const carreras = await Carrera.findAndCountAll({
        attributes: ["id", "nombre_carrera", "docenteId"],
        include: includeClause,
        where: whereClause,
        offset,
        limit
        });
        return carreras;
    } catch (error) {
        throw error;
    }
};

const getAllCarreras = async () => {
    try {
        const carreras = await Carrera.findAll({
            attributes: ["id", "nombre_carrera", "docenteId"],
            include: [
                {
                    model: Docente,
                    attributes: ["trabajadorId", "nombre_usuario"],
                    required: false,
                    as: 'guia'
                },
            ]
        });
    return carreras;
    } catch (error) {
        throw error;
    }
};

const createCarrera = async (datos) => {
    try {
        const {
            nombre_carrera,
            facultad
        } = datos
        if (facultad){
            try{
                await sigenu.getFacultyData(facultad)
            }catch(error){
                throw new AppError("Hubo un problema al buscar la facultad "+ error.message, 500)
            }
        }
        const carrera = await Carrera.create({ 
            nombre_carrera,
            facultad
        });
        return carrera;
    } catch (error) {
        throw error;
    }
};

const updateCarrera = async (id, nombre_carrera) => {
    try {
        const carrera = await Carrera.update(
            { nombre_carrera},
            { where: { id } }
        );
        return carrera;
    } catch (error) {
        throw error;
    }
};

const deleteCarrera = async (id) => {
    try {
        const carrera = await Carrera.destroy({ where: { id } });
        return carrera;
    } catch (error) {
        throw error;
    }
};

const asignarGuiaCarrera = async (carreraId, docenteId) => {
    try {
        // Verificar que la carrera existe
        const carrera = await Carrera.findByPk(carreraId);
        if (!carrera) {
            throw new AppError("Carrera no encontrada", 404);
        }

        // Verificar que el docente existe
        const docente = await Docente.findByPk(docenteId);
        if (!docente) {
            throw new AppError("Docente no encontrado", 404);
        }

        // Verificar que el docente no esté ya asignado como guia de otra carrera
        const carreraExistente = await Carrera.findOne({ where: { docenteId } });
        if (carreraExistente && carreraExistente.id !== parseInt(carreraId)) {
            throw new AppError("El docente ya está asignado como guia de otra carrera", 400);
        }

        // Asignar el trabajador como jefe de la beca
        await Carrera.update(
            { docenteId },
            { where: { id: carreraId } }
        );

    // Retornar la carrera actualizada con los datos del guia
    const carreraActualizada = await Carrera.findByPk(carreraId, {
        include: [
        {
            model: Docente,
            attributes: ["trabajadorId", "nombre_usuario"],
            required: false,
            as: 'guia'
        },
        ]
    });

        return carreraActualizada;
    } catch (error) {
        throw error;
    }
};

module.exports = { createCarrera, updateCarrera, getCarrera, deleteCarrera, getAllCarreras, asignarGuiaCarrera };