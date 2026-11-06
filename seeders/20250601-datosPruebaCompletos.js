"use strict";

//const bcrypt = require("bcryptjs");
const hashPass  = require("../helpers/hashPass.js");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash de contraseñas
    const passwordHash = await hashPass.hashPassword("admin123");
    const docentePasswordHash = await hashPass.hashPassword("docente123");

    // Insertar trabajadores (administrador y docentes)
    await queryInterface.bulkInsert(
      "trabajadores",
      [
        {
          ci: "12345678",
          nombre: "Elena",
          apellido: "Cárdenas",
          telefono: "55512345",
          nivel_escolaridad: "Universitario",
          sexo: "Femenino",
          nombre_usuario: "ecardenas",
          rol: "administrador",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ci: "87654321",
          nombre: "Carlos",
          apellido: "Rodríguez",
          telefono: "55554321",
          nivel_escolaridad: "Doctorado",
          sexo: "Masculino",
          nombre_usuario: "crodriguez",
          rol: "docente",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ci: "11223344",
          nombre: "María",
          apellido: "González",
          telefono: "55567890",
          nivel_escolaridad: "Maestría",
          sexo: "Femenino",
          nombre_usuario: "mgonzalez",
          rol: "docente",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Insertar docentes
    await queryInterface.bulkInsert(
      "docentes",
      [
        {
          trabajadorId: "87654321",
          facultadId: "FACULTAD_DE_CIENCIAS",
          cargo: "Profesor Titular",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          trabajadorId: "11223344",
          facultadId: "FACULTAD_DE_CIENCIAS",
          cargo: "Profesor Asociado",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Insertar carreras
    await queryInterface.bulkInsert(
      "carreras",
      [
        {
          nombre_carrera: "Ingeniería Informática",
          docenteId: "87654321",
          facultad: "FACULTAD_DE_CIENCIAS",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre_carrera: "Ingeniería Industrial",
          facultad: "FACULTAD_DE_CIENCIAS",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Insertar asignaturas
    await queryInterface.bulkInsert(
      "asignaturas",
      [
        {
          nombre_asignatura: "Programación I",
          facultad: "FACULTAD_DE_CIENCIAS",
          semestre: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre_asignatura: "Estructuras de Datos",
          facultad: "FACULTAD_DE_CIENCIAS",
          semestre: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre_asignatura: "Bases de Datos",
          facultad: "FACULTAD_DE_CIENCIAS",
          semestre: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Insertar cursos
    await queryInterface.bulkInsert(
      "cursos",
      [
        {
          nombre_curso: "2025-2026",
          fecha_inicio: "2025-09-01",
          fecha_fin: "2026-07-31",
          estado: "activo",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Insertar planes
    await queryInterface.bulkInsert(
      "planes",
      [
        {
          nombre_plan: "Plan de Estudios 2025",
          descripcion_plan: "Plan de estudios actualizado para el año 2025-2026",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Insertar asignatura_carrera (relación)
    const carreraId = 1; // Ingeniería Informática
    const asignaturaId1 = 1; // Programación I
    const asignaturaId2 = 2; // Estructuras de Datos
    const asignaturaId3 = 3; // Bases de Datos
    const planId = 1;

    await queryInterface.bulkInsert(
      "asignatura_carreras",
      [
        {
          horas_clase: 64,
          anno_academico: 3,
          asignaturaId: asignaturaId1,
          carreraId: carreraId,
          planId: planId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          horas_clase: 64,
          anno_academico: 2,
          asignaturaId: asignaturaId2,
          carreraId: carreraId,
          planId: planId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          horas_clase: 64,
          anno_academico: 3,
          asignaturaId: asignaturaId3,
          carreraId: carreraId,
          planId: planId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Insertar profesores_asignaturas (relación)
    await queryInterface.bulkInsert(
      "profesores_asignaturas",
      [
        {
          asignaturaId: asignaturaId1,
          profesorId: "87654321",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          asignaturaId: asignaturaId2,
          profesorId: "87654321",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          asignaturaId: asignaturaId3,
          profesorId: "11223344",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Insertar horarios
    await queryInterface.bulkInsert(
      "horarios",
      [
        {
          numero_semana: 1,
          fecha_inicio_semana: "2025-09-01",
          fecha_fin_semana: "2025-09-07",
          hora_inicio: "08:00",
          horario_fin: "18:00",
          cursoId: 1,
          carreraId: carreraId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Insertar turnos
    await queryInterface.bulkInsert(
      "turnos",
      [
        {
          dia_semana: 1, // Lunes
          horario_inicio: "08:00",
          horario_fin: "10:00",
          estado: "disponible",
          asignaturaId: asignaturaId1,
          docenteCI: null,
          horarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          dia_semana: 1, // Lunes
          horario_inicio: "10:00",
          horario_fin: "12:00",
          estado: "disponible",
          asignaturaId: asignaturaId2,
          docenteCI: null,
          horarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          dia_semana: 2, // Martes
          horario_inicio: "14:00",
          horario_fin: "16:00",
          estado: "disponible",
          asignaturaId: asignaturaId3,
          docenteCI: null,
          horarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // Eliminar en orden inverso por las foreign keys
    await queryInterface.bulkDelete("turnos", null, {});
    await queryInterface.bulkDelete("horarios", null, {});
    await queryInterface.bulkDelete("profesores_asignaturas", null, {});
    await queryInterface.bulkDelete("asignatura_carrera", null, {});
    await queryInterface.bulkDelete("planes", null, {});
    await queryInterface.bulkDelete("cursos", null, {});
    await queryInterface.bulkDelete("asignaturas", null, {});
    await queryInterface.bulkDelete("carreras", null, {});
    await queryInterface.bulkDelete("docentes", null, {});
    await queryInterface.bulkDelete("trabajadores", null, {});
  },
};
