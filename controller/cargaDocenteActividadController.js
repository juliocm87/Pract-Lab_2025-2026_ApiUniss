const AppError = require("../error/AppError");
const { Op } = require("sequelize");
const CargaDocenteActividad = require("../models/cargaDocenteActividad");
const CargaDocente = require("../models/cargaDocente");
const Actividades = require("../models/actividad");

const getActividadesPorCargaDocente = async (cargaDocente) => {
    try {
        const actividades = CargaDocenteActividad.findAndCountAll({
            attributes: ["horas"],
            include: [{
                model: Actividades,
                attributes: ["numero", "nombre", "descripcion"]
            }],
            where: {
                cargaDocenteId: cargaDocente
            }
        })
        return actividades
    } catch (error) {
        throw error;
    }
}

const createCargaDocenteActividad = async (datos) => {
    try {
        const {
            actividadId,
            cargaDocenteId,
            horas
        } = datos
        const cargaDocenteActividad = await CargaDocenteActividad.create({ 
            actividadId: actividadId,
            cargaDocenteId: cargaDocenteId,
            horas: horas
        });
        return cargaDocenteActividad;
    } catch (error) {
        throw error;
    }
};

const updateCargaDocenteActividad = async (id, datos) => {
    try {
        const {
            actividadId,
            cargaDocenteId,
            horas
        } = datos
        const cargaDocenteActividad = await CargaDocenteActividad.update(
            { 
                actividadId: actividadId,
                cargaDocenteId: cargaDocenteId,
                horas: horas
            },
            { where: { id } }
        );
        return cargaDocenteActividad;
    } catch (error) {
        throw error;
    }
};

const deleteCargaDocenteActividad = async (id) => {
    try {
        const cargaDocenteActividad = await CargaDocenteActividad.destroy({ where: { id } });
        return cargaDocenteActividad;
    } catch (error) {
        throw error;
    }
};

module.exports = { createCargaDocenteActividad, updateCargaDocenteActividad, deleteCargaDocenteActividad, getActividadesPorCargaDocente };