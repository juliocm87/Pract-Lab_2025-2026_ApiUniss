const AppError = require("../error/AppError");
const Asignatura = require("../models/asignaturas");
const Plan = require("../models/planes")
const { Op, where } = require("sequelize");
const AsignaturaCarrera = require("../models/asignaturaCarreras")
const Carrera = require("../models/carreras");

const getAllplanes = async()=>{
    try{
        const todos = await Plan.findAll({
            include: [
                {
                    model: AsignaturaCarrera,
                    required: false,
                },
                
            ]
        });
    return todos;
    }catch(error){
        throw new AppError("Error al buscar todos los planes", 500)
    }
}

const updatePlan =async (id, datos) =>{
    try{
        const actualizado = await Plan.update({
            nombre_plan: datos.nombre_plan, 
            descripcion_plan: datos.descripcion_plan
        },
        {
            where: {id}
        }
        )
    }catch(error){
        throw new AppError("Error al actualizar el plan "+id+" "+error.message, 500)
    }
}

const deletePlan = async (id) =>{
    try{
        if(!await Plan.findByPk(id)){
            throw new AppError("El plan "+id+" no existe", 404)
        }
        const eliminar = await Plan.destroy({where: {id}})
        return eliminar
    }catch(error){
        throw new AppError("Error al eliminar el plan "+id+": "+error.message, 500)
    }
}


const createPlan = async (datos) =>{
    try{
        
        const plan = await Plan.create({
            nombre_plan: datos.nombre_plan, 
            descripcion_plan: datos.descripcion_plan
        })
        return plan
    }catch(error){
        throw new AppError("error al crear AsignaturaCarrera"+error.message, 500)
    }
}

module.exports = {createPlan, updatePlan, deletePlan, getAllplanes}