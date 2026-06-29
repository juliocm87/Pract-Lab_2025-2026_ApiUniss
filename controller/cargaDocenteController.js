const AppError = require("../error/AppError");
const { Op } = require("sequelize");
const CargaDocenteActividad = require("../models/cargaDocenteActividad");
const CargaDocente = require("../models/cargaDocente");
const Actividades = require("../models/actividad");
const Docentes = require("../models/docentes");
const Trabajadores = require("../models/trabajadores");

const getTrabajadoresConCargaDocente = async (mes, anno) => {
    try {
        const trabajadores = await CargaDocente.findAndCountAll({
            attributes: [],
            include: [{
                model: Docentes,
                attributes: [],
                include: [{
                    model: Trabajadores,
                    attributes: ["ci", "nombre", "apellido", "nivel_escolaridad"]
                }]
            }],
            where: {
                mes,
                anno
            }
        }) 
        return trabajadores
    } catch (error) {
        throw error;
    }
}

const getTrabajadoresSinCargaDocente = async (mes, anno) => {
    try {
        const trabajadoresConCarga = await CargaDocente.findAll({
            attributes: ["docenteCI"],
            where: {
                mes: mes,
                anno: anno,
            }
        })
        const docenteCIs = trabajadoresConCarga.map(carga => carga.docenteCI);
        const trabajadoresSinCarga = await Docentes.findAll({
            where: {
                trabajadorId: {
                    [Op.notIn]: docenteCIs
                }
            },
            include: [
                {
                    model: Trabajadores,
                    attributes: ["ci", "nombre", "apellido", "nivel_escolaridad"]
                }]
            }
        )
        return trabajadoresSinCarga
    } catch (error) {
        throw error;
    }
}

const getCargaDocentePorEstado = async (mes, anno, estado) => {
    try {
        const cargaDocente = await CargaDocente.findAndCountAll({
            attributes: ["id", "docenteCI", "modalidad", "total_horas", "horas_sobrecarga"],
            where: {
                mes,
                anno,
                estado
            }
        })
        return cargaDocente
    } catch (error) {
        throw error;
    }
}

const getCargaDocentePorDocenteFecha = async (mes, anno, docenteCI) => {
    try {
        const cargaDocente = await CargaDocente.findAndCountAll({
            attributes: ["id", "docenteCI", "modalidad", "total_horas", "horas_sobrecarga"],
            where: {
                mes,
                anno,
                docenteCI
            }
        })
        return cargaDocente
    } catch (error) {
        throw error;
    }
}

const getCargaDocentePorDocente = async (docenteCI) => {
    try {
        const cargaDocente = await CargaDocente.findAndCountAll({
            attributes: ["id", "modalidad", "total_horas", "horas_sobrecarga"],
            where: {
                docenteCI
            }
        })
        return cargaDocente
    } catch (error) {
        throw error;
    }
}

const createCargaDocente = async (datos) => {
    try {
        const {
            docenteCI,
            anno,
            mes,
            estado,
            modalidad,
            total_horas,
            horas_sobrecarga,
        } = datos
        const cargaDocente = await CargaDocente.create({ 
            docenteCI,
            anno,
            mes,
            estado,
            modalidad,
            total_horas,
            horas_sobrecarga,
        });
        return cargaDocente;
    } catch (error) {
        throw error;
    }
};

const updateCargaDocente = async (id, datos) => {
    try {
        const {
            docenteCI,
            anno,
            mes,
            estado,
            modalidad,
            total_horas,
            horas_sobrecarga,
        } = datos
        if(!(await CargaDocente.findByPk(id))){
            throw new AppError("La cargaDocente no existe", 404)
        }
        const cargaDocente = await CargaDocente.update(
            { 
                docenteCI,
                anno,
                mes,
                estado,
                modalidad,
                total_horas,
                horas_sobrecarga,
            },
            { where: { id } }
        );
        return cargaDocente;
    } catch (error) {
        throw error;
    }
};

const deleteCargaDocente = async (id) => {
    try {
        const cargaDocente = await CargaDocente.destroy({ where: { id } });
        return cargaDocente;
    } catch (error) {
        throw error;
    }
};

module.exports = { createCargaDocente, updateCargaDocente, deleteCargaDocente, getCargaDocentePorDocente, getCargaDocentePorEstado, getTrabajadoresConCargaDocente, getCargaDocentePorDocenteFecha, getTrabajadoresSinCargaDocente };