const AppError = require("../error/AppError");
const Asignatura = require("../models/asignaturas");
const { Op, where } = require("sequelize");
const AsignaturaCarrera = require("../models/asignaturaCarreras")
const Carrera = require("../models/carreras");

const getAllAsignaturaCarrera = async()=>{
    try{
        const todos = await AsignaturaCarrera.findAll({
            include: [
                {
                    model: Asignatura,
                    attributes: ["id", "nombre_asignatura"],
                    required: false,
                },
                {
                    model: Carrera,
                    attributes: ["id", "nombre_carrera"],
                    required: false
                }
            ]
        });
    return todos;
    }catch(error){
        throw new AppError("Error al buscar todas las asignaturasCarreras", 500)
    }
}

const deleteAsignaturaCarrera = async (id) =>{
    try{
        if(!await AsignaturaCarrera.findByPk(id)){
            throw new AppError("La asignaturaCarrera "+id+" no existe", 404)
        }
        const eliminar = await AsignaturaCarrera.destroy({where: {id}})
        return eliminar
    }catch(error){
        throw new AppError("Error al eliminar AsignaturaCarrera "+id+": "+error.message, 500)
    }
}

const updateAsignaturaCarrera = async (id, datos) =>{
    try{
        const existe = AsignaturaCarrera.findByPk(id)
        if (!existe){
            throw new AppError("No se encontró la asignaturaCarrera "+id, 404)
        }
        const actualizada = await existe.update(
            {
                horas_clase: datos.horas,
                hora_inicio: datos.hora_inicio,
                horario_fin: datos.horario_fin,
                idAsignatura: datos.idAsignatura, 
                idCarrera: datos.idCarrera, 
                anno_academico: datos.anno_academico
            }
        )
    }catch(error){
        throw new AppError("Error al actualizar aignatura carrera "+id+" "+error.message, 500)
    }
}

const createAsignaturaCarrera = async (datos) =>{
    try{
        const asignatura = await Asignatura.findByPk(idAsignatura);
        const carrera = await Carrera.findByPk(idCarrera);
        if (!asignatura || !carrera){
            throw new AppError ("La carrera o la asignatura no existe", 404)
        }
        const asignaturaCarrea = await AsignaturaCarrera.create({
            horas_clase: datos.horas,
            hora_inicio: datos.hora_inicio,
            horario_fin: datos.horario_fin,
            carreraId: datos.idCarrera,
            asignaturaId: datos.idAsignatura,
            anno_academico: datos.anno_academico
        })
        return asignaturaCarrea
    }catch(error){
        throw new AppError("error al crear AsignaturaCarrera"+error.message, 500)
    }
}

module.exports ={getAllAsignaturaCarrera, deleteAsignaturaCarrera, createAsignaturaCarrera, updateAsignaturaCarrera}