const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../error/AppError");
const authenticate = require("../middlewares/authenticate");







const {
  createEstudiante,
  deleteEstudiante,
  getEstudiantes,
  updateEstudiante,
  getEstudianteCompleto,
  verificarDatosEstudiante,
  migrarPrematriculasAMatricula,
  buscarEstudiantePorCI
} = require("../controller/estudianteController");

/**
 * @swagger
 * /estudiantes:
 *   get:
 *     summary: Obtiene una lista paginada de estudiantes con datos de SIGENU
 *     tags:
 *       - Estudiante
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de estudiantes por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de estudiantes a omitir (para paginación)
 *       - in: query
 *         name: filtroTipo
 *         schema:
 *           type: string
 *           enum: [todos, matricula, prematricula]
 *           default: todos
 *         description: Filtro por tipo de estudiante
 *     responses:
 *       200:
 *         description: Lista paginada de estudiantes con datos locales y de SIGENU
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estudiantes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Estudiantes'
 *                 total:
 *                   type: integer
 *                   description: Total de estudiantes
 *                 limit:
 *                   type: integer
 *                   description: Límite de estudiantes por página
 *                 offset:
 *                   type: integer
 *                   description: Offset de la página actual
 *                 totalPages:
 *                   type: integer
 *                   description: Total de páginas
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/estudiantes",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { limit = 10, offset = 0, filtroTipo = 'todos' } = req.query;
      const resultado = await getEstudiantes(limit, offset, filtroTipo);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /estudiantes/{ci}:
 *   get:
 *     summary: Obtiene datos completos de un estudiante incluyendo información de SIGENU
 *     tags:
 *       - Estudiante
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ci
 *         required: true
 *         schema:
 *           type: string
 *         description: CI del estudiante
 *     responses:
 *       200:
 *         description: Datos completos del estudiante
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Estudiante no encontrado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/estudiantes/:ci",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { ci } = req.params;
      const estudiante = await getEstudianteCompleto(ci);
      res.status(200).json(estudiante);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /estudiantes/verificar/{ci}:
 *   get:
 *     summary: Obtiene datos completos de un estudiante de la información de SIGENU
 *     tags:
 *       - Estudiante
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ci
 *         required: true
 *         schema:
 *           type: string
 *         description: CI del estudiante
 *     responses:
 *       200:
 *         description: Datos del estudiante
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Estudiante no encontrado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/estudiantes/verificar/:ci",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { ci } = req.params;
      const estudiante = await verificarDatosEstudiante(ci);
      res.status(200).json(estudiante);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /estudiantes/beca/:becaId:
 *   get:
 *     summary: Obtiene una lista de estudiantes por beca
 *     tags:
 *       - Estudiante
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: becaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la beca
 *     responses:
 *       200:
 *         description: Lista de estudiantes por beca
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/estudiantes/beca/:becaId",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { becaId } = req.params;
      // Implementa la lógica para obtener estudiantes por beca
      res.status(200).json({ message: "Lista de estudiantes por beca" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /estudiantes/create:
 *   post:
 *     summary: Crea un nuevo estudiante verificando su existencia en SIGENU
 *     tags:
 *       - Estudiante
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ci:
 *                 type: string
 *                 description: Cédula de identidad del estudiante
 *               cuartoId:
 *                 type: string
 *                 description: ID del cuarto
 *               nombre:
 *                 type: string
 *                 description: Nombre del estudiante
 *               apellido:
 *                 type: string
 *                 description: Apellido del estudiante
 *               facultad:
 *                 type: string
 *                 description: Facultad del estudiante
 *               carrera:
 *                 type: string
 *                 description: Carrera del estudiante
 *               prematricula:
 *                 type: string
 *                 description: Pre-matricula del estudiante
 *               anno_academico:
 *                 type: string
 *                 description: Año académico del estudiante
 *             required:
 *               - ci
 *               - cuartoId
 *     responses:
 *       201:
 *         description: Estudiante creado exitosamente
 *       400:
 *         description: CI es requerido, ya existe o no existe en SIGENU
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.post(
  "/estudiantes/create",
  authenticate(["administrador","secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { ci, cuartoId, nombre, apellido, facultad, carrera, prematricula, anno_academico } = req.body;

      if (!ci) {
        throw new AppError("El CI es requerido", 400);
      }

      const estudiante = await createEstudiante(ci, cuartoId, nombre, apellido, facultad, carrera, prematricula, anno_academico);
      res.status(201).json(estudiante);
    } catch (error) {
      if (error?.parent?.detail?.includes("ci")) {
        return next(new AppError("Ya existe un estudiante con ese CI", 400));
      }
      if (error.message.includes("SIGENU")) {
        return next(new AppError("El estudiante no existe en SIGENU", 400));
      }
      next(error);
    }
  }
);

/**
 * @swagger
 * /estudiantes/update/{ci}:
 *   put:
 *     summary: Actualiza un estudiante existente y obtiene datos actualizados de SIGENU
 *     tags:
 *       - Estudiante
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ci
 *         required: true
 *         schema:
 *           type: string
 *         description: CI del estudiante
 *     responses:
 *       200:
 *         description: Estudiante actualizado exitosamente
 *       400:
 *         description: CI es requerido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Estudiante no encontrado
 *       500:
 *         description: Error de servidor
 */
router.put(
  "/estudiantes/update/:ci",
  authenticate(["administrador","secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { ci } = req.params;
      const { nombre, apellido, facultad, carrera, prematricula, cuartoId, anno_academico } = req.body;
      console.log(req.body)
      
      console.log("cuarto",cuartoId)
      if (!ci) {
        throw new AppError("El CI es requerido", 400);
      }

      const campos = { nombre, apellido, facultad, carrera, prematricula, cuartoId, anno_academico };
      // Elimina los campos undefined
      Object.keys(campos).forEach(key => campos[key] === undefined && delete campos[key]);

      const estudiante = await updateEstudiante(ci, campos);
      if (!estudiante) {
        throw new AppError("Estudiante no encontrado", 404);
      }

      res.status(200).json({
        mensaje: "Estudiante actualizado",
        data: estudiante
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /estudiantes/delete/{ci}:
 *   delete:
 *     summary: Elimina un estudiante
 *     tags:
 *       - Estudiante
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ci
 *         required: true
 *         schema:
 *           type: string
 *         description: CI del estudiante
 *     responses:
 *       200:
 *         description: Estudiante eliminado exitosamente
 *       400:
 *         description: CI es requerido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Estudiante no encontrado
 *       500:
 *         description: Error de servidor
 */
router.delete(
  "/estudiantes/delete/:ci",
  authenticate(["administrador","secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { ci } = req.params;

      if (!ci) {
        throw new AppError("El CI es requerido", 400);
      }

      const estudiante = await deleteEstudiante(ci);
      if (!estudiante) {
        throw new AppError("Estudiante no encontrado", 404);
      }

      res.status(200).json({ mensaje: "Estudiante eliminado" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /estudiantes/migrar-prematricula:
 *   post:
 *     summary: Migra todos los estudiantes de prematrícula a matrícula si existen en SIGENU
 *     tags:
 *       - Estudiante
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resultado de la migración
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.post(
  "/estudiantes/migrar-prematricula",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const resultado = await migrarPrematriculasAMatricula();
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /estudiantes/ci/{ci}:
 *   get:
 *     summary: Busca un estudiante por CI en la base de datos local y SIGENU
 *     tags:
 *       - Estudiante
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ci
 *         required: true
 *         schema:
 *           type: string
 *         description: CI del estudiante
 *     responses:
 *       200:
 *         description: Datos del estudiante encontrado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Estudiante no encontrado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/estudiantes/ci/:ci",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { ci } = req.params;
      
      if (!ci) {
        throw new AppError("El CI es requerido", 400);
      }

      const resultado = await buscarEstudiantePorCI(ci);
      
      if (resultado.encontrado) {
        res.status(200).json({
          nombre: resultado.nombre,
          encontrado: true,
          fuente: resultado.fuente
        });
      } else {
        res.status(404).json({
          nombre: null,
          encontrado: false,
          error: resultado.error
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
