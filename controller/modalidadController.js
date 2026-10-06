const AppError = require("../error/AppError");
const Modalidades = require("../models/modalidad");

// Obtener todas las modalidades (sin paginación)
const getAllModalidades = async () => {
    try {
        const modalidades = await Modalidades.findAll({
            attributes: ["id", "nombre", "descripcion"]
        });
        return modalidades;
    } catch (error) {
        throw error;
    }
};

// Crear modalidad
const createModalidad = async (datos) => {
    try {
        const { nombre, descripcion } = datos;
        const existingModalidad = await Modalidades.findOne({ where: { nombre } });
        if (existingModalidad) {
            throw new AppError("Ya existe una modalidad con ese nombre", 400);
        }
        const nuevaModalidad = await Modalidades.create({
            nombre,
            descripcion
        });
        return nuevaModalidad;
    } catch (error) {
        throw error;
    }
};

// Actualizar modalidad
const updateModalidad = async (id, datos) => {
    try {
        const { nombre, descripcion } = datos;
        const modalidadActualizada = await Modalidades.update(
            { nombre, descripcion },
            { where: { id } }
        );
        return modalidadActualizada;
    } catch (error) {
        throw error;
    }
};

// Eliminar modalidad
const deleteModalidad = async (id) => {
    try {
        const modalidadEliminada = await Modalidades.destroy({ where: { id } });
        return modalidadEliminada;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllModalidades,
    createModalidad,
    updateModalidad,
    deleteModalidad
};