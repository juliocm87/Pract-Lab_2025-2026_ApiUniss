const AppError = require("../error/AppError");
const { Op } = require("sequelize");
const CargaDocenteActividad = require("../models/cargaDocenteActividad");
const CargaDocente = require("../models/cargaDocente");
const Actividades = require("../models/actividad");

const createActividad = async (datos) => {
    try {
        const {
            numero,
            nombre,
            descripcion
        } = datos
        if(await Actividades.findByPk(numero)){
            throw new AppError(`La actividad numero: ${numero} ya existe`, 500)
        }
        const actividad = await Actividades.create({ 
            numero: numero,
            nombre: nombre,
            descripcion: descripcion
        });
        return actividad;
    } catch (error) {
        throw error;
    }
};

const updateActividad = async (numero, datos) => {
    try {
        const {
            nombre,
            descripcion
        } = datos
        const actividad = await Actividades.update(
            { 
                nombre: nombre,
                descripcion: descripcion
            },
            { where: { numero } }
        );
        return actividad;
    } catch (error) {
        throw error;
    }
};

const deleteActividad = async (numero) => {
    try {
        const actividad = await Comentarios.destroy({ where: { numero } });
        return actividad;
    } catch (error) {
        throw error;
    }
};

module.exports = { createActividad, updateActividad, deleteActividad };