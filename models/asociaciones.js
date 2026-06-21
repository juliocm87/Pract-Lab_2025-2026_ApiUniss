const AsignaturaCarreras = require("./asignaturaCarreras");
const Asignaturas = require("./asignaturas");
const Becas = require("./becas");
const Carreras = require("./carreras");
const Cuartos = require("./cuartos");
const Cursos =require("./cursos");
const Docentes = require("./docentes");
const Estudiantes = require("./estudiantes");
const Horarios = require("./horarios");
const Incidencias = require("./incidencias");
const Pisos = require("./pisos");
const Planes = require("./planes");
const Torres = require("./torres");
const Trabajadores = require("./trabajadores");
const Turnos = require("./turnos")


//relacion (asignaturas-carreras) N-N a través de asignatura_carrera
Asignaturas.belongsToMany(Carreras, {
    through: AsignaturaCarreras,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Asignaturas.hasMany(AsignaturaCarreras);
AsignaturaCarreras.belongsTo(Asignaturas)

Carreras.belongsToMany(Asignaturas, {
    through: AsignaturaCarreras,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Carreras.hasMany(AsignaturaCarreras);
AsignaturaCarreras.belongsTo(Carreras)

// Relación con Docentes (Uno a Uno) - Carrera tiene un Docente como guia
Docentes.hasOne(Carreras, {
    foreignKey: "docenteId",
    sourceKey: "trabajadorId",
    as: "guia",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

Carreras.belongsTo(Docentes, {
    foreignKey: "docenteId",
    targetKey: "trabajadorId",
    as: "guia",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

//RElacion N-N entre asignaturas y docentes a través de profesores_asignaturas
Asignaturas.belongsToMany(Docentes, {
    through: 'profesores_asignaturas',
    foreignKey: 'asignaturaId',
    otherKey: 'profesorId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

//Relacion N-1 entre becas y torres
Becas.hasMany(Torres, {
    foreignKey: "becaId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});
Torres.belongsTo(Becas, {
    foreignKey: "becaId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

//Relacion N-1 entre cuartos y estudiantes
Cuartos.hasMany(Estudiantes, {
    foreignKey: "cuartoId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Estudiantes.belongsTo(Cuartos, {
    foreignKey: "cuartoId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

// Relación con Trabajadores (Uno a Uno)
Docentes.belongsTo(Trabajadores, {
    foreignKey: "trabajadorId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Trabajadores.hasOne(Docentes, {
    foreignKey: "trabajadorId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

// Relación con Turnos (un Horario tiene muchos Turnos)
Horarios.hasMany(Turnos, {
    foreignKey: "horarioId",
    as: "turnos",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Turnos.belongsTo(Horarios, {
    foreignKey: "horarioId",
    as: "horario",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

// Relación con Cursos (un Horario pertenece a un Curso)
Cursos.hasMany(Horarios, {
    foreignKey: "cursoId",
    as: "horarios",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

Horarios.belongsTo(Cursos, {
    foreignKey: "cursoId",
    as: "curso",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

// Relación con Carreras (un Horario pertenece a una Carrera)
Carreras.hasMany(Horarios, {
    foreignKey: "carreraId",
    as: "horarios",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

Horarios.belongsTo(Carreras, {
    foreignKey: "carreraId",
    as: "carrera",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

// Relación muchos a muchos con Estudiantes
Incidencias.belongsToMany(Estudiantes, {
    through: 'estudiante_incidencias',
    foreignKey: 'incidenciaId',
    otherKey: 'estudianteId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Relación con Cuartos (Uno a Muchos)
Pisos.hasMany(Cuartos, {
    foreignKey: "pisoId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});
Cuartos.belongsTo(Pisos, {
    foreignKey: "pisoId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

//Relaciones planes
Planes.hasMany(AsignaturaCarreras, {
    foreignKey: "planId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});
AsignaturaCarreras.belongsTo(Planes, {
    foreignKey: "planId",
    as: "plan",
});

//Relaciones torres
Torres.hasMany(Pisos, {
    foreignKey: "torreId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});
Pisos.belongsTo(Torres, {
    foreignKey: "torreId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

// Relación con Becas (Muchos a Uno) - Trabajador pertenece a una Beca
Trabajadores.belongsTo(Becas, {
    foreignKey: "becaId",
    as: "beca",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Becas.hasMany(Trabajadores, {
    foreignKey: "becaId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

// Relación con Becas (Uno a Uno) - Beca tiene un Trabajador como jefe
Trabajadores.hasOne(Becas, {
    foreignKey: "trabajadorId",
    as: "becaJefe",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

Becas.belongsTo(Trabajadores, {
    foreignKey: "trabajadorId",
    as: "becaJefe",

    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

// Relación con Cuartos (Muchos a Uno)
Trabajadores.belongsTo(Cuartos, {
    foreignKey: "cuartoId",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

Cuartos.hasMany(Trabajadores, {
    foreignKey: "cuartoId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Trabajadores.hasOne(Pisos, {
    foreignKey: "trabajadorId",
    as: "trabajadorSupervisor",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

// Relación con Pisos (Uno a Uno) - Trabajador supervisa un piso
Pisos.belongsTo(Trabajadores, {
    foreignKey: "trabajadorId",
    as: "trabajadorSupervisor",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

// Relación con Asignaturas (un Turno pertenece a una Asignatura)
Asignaturas.hasMany(Turnos, {
    foreignKey: "asignaturaId",
    as: "turnos",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

Turnos.belongsTo(Asignaturas, {
    foreignKey: "asignaturaId",
    as: "asignatura",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

// Relación con Docentes (un Turno pertenece a un Docente)
Docentes.hasMany(Turnos, {
    foreignKey: "docenteCI",
    sourceKey: "trabajadorId",
    as: "turnos",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

Turnos.belongsTo(Docentes, {
    foreignKey: "docenteCI",
    targetKey: "trabajadorId",
    as: "docente",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

module.exports = [
    AsignaturaCarreras, 
    Asignaturas, 
    Becas,
    Carreras,
    Cuartos,
    Cursos,
    Docentes,
    Estudiantes,
    Horarios,
    Incidencias,
    Pisos,
    Planes,
    Torres,
    Trabajadores, 
    Turnos
];