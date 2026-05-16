//put actualizar
//post crear , realizar login
//get
//delete
const router = require("express").Router();
const AppError = require("../error/AppError");

const {
    createCarrera,
    deleteCarrera,
    getCarrera,
    updateCarrera,
    getAllCarreras,
    asignarGuiaCarrera,
} = require("../controller/carreraController");
const authenticate = require("../middlewares/authenticate");



/**
 * @swagger
 * /carreras:
 *   get:
 *     summary: Obtiene una lista de carreras
 *     tags:
 *       - Carrera
 *     responses:
 *       200:
 *         description: Lista de carreras
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *       500:
 *         description: Error de servidor
 */
router.get(
    "/carreras",
    authenticate(["administrador", "decano", "secretaria_beca", "docente", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const carreras = await getAllCarreras();
      res.status(200).json(carreras);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /carreras/{limit}/{offset}:
 *   get:
 *     summary: Obtiene una lista paginada de carreras con búsqueda opcional
 *     tags:
 *       - Carrera
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de carreras a obtener
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de carreras a omitir
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar carreras por nombre o guia
 *     responses:
 *       200:
 *         description: Lista paginada de carreras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                 count:
 *                   type: integer
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/carreras/:limit/:offset",
  authenticate(["administrador", "decano", "secretaria_beca", "docente", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const limit = parseInt(req.params.limit) || 10;
      const offset = parseInt(req.params.offset) || 0;
      const searchTerm = req.query.search || '';
      const carreras = await getCarrera(offset, limit, searchTerm);
      res.status(200).json({
        rows: carreras.rows,
        count: carreras.count
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /carreras/create:
 *   post:
 *     summary: Crea una nueva carrera
 *     tags:
 *       - Carrera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_carrera:
 *                 type: string
 *              
 *     responses:
 *       201:
 *         description: Carrera creada
 *       400:
 *         description: Todos los campos son requeridos
 *       500:
 *         description: Error de servidor
 */
router.post(
  "/carreras/create",
  authenticate(["administrador","secretaria_beca", "docente", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { nombre_carrera} = req.body;

      if (!nombre_carrera ) {
        throw new AppError("Todos los campos son requeridos", 400);
      }
      const carrera = await createCarrera(nombre_carrera);
      res.status(201).json(carrera);
    } catch (error) {
      if (error?.parent?.detail.includes("nombre_carrera")) {
        return next(new AppError("Ya existe la carrera", 400));
      }
      next(error); //Error de servidor 500
    }
  }
);

/**
 * @swagger
 * /"docente"/update/{id}:
 *   put:
 *     summary: Actualiza una carrera existente
 *     tags:
 *       - Carrera
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la carrera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_carrera:
 *                 type: string
 *     responses:
 *       200:
 *         description: Carrera actualizada
 *       400:
 *         description: El id es requerido o todos los campos son requeridos
 *       404:
 *         description: Carrera no encontrada
 *       500:
 *         description: Error de servidor
 */
router.put(
  "/carreras/update/:id",
  authenticate(["administrador","secretaria_beca", "docente", "jefe_beca"]),
  async (req, res, next) => {
    //:id es para rcibir parametros
    try {
      const { nombre_carrera } = req.body;
      const { id } = req.params;

      if (!id) {
        throw new AppError("El id es requerido", 400);
      }

      if (!nombre_carrera) {
        throw new AppError("Todos los campos son requeridos", 400);
      }
      const carrera = await updateCarrera(id, nombre_carrera);
      if (carrera == 0) {
        throw new AppError("Carrera no encontrada", 404);
      }

      res.status(200).json({ mensaje: "Carrera actualizada " });
    } catch (error) {
      if (error?.parent?.detail.includes("nombre_carrera")) {
        return next(new AppError("Ya existe la carrera", 400));
      }
      next(error); //Error de servidor 500
    }
  }
);

/**
 * @swagger
 * /carreras/delete/{id}:
 *   delete:
 *     summary: Elimina una carrera
 *     tags:
 *       - Carrera
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la carrera
 *     responses:
 *       200:
 *         description: Carrera eliminada
 *       400:
 *         description: El id es requerido
 *       404:
 *         description: Carrera no encontrada
 *       500:
 *         description: Error de servidor
 */
router.delete(
  "/carreras/delete/:id",
  authenticate(["administrador","secretaria_beca", "docente", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError("El id es requerido", 400);
      }

      const carrera = await deleteCarrera(id);
      if (carrera == 0) {
        throw new AppError("Carrera no encontrada", 404);
      }

      res.status(200).json({ mensaje: "Carrera eliminada" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /carreras/{carreraId}/asignar-guia:
 *   post:
 *     summary: Asigna un docente como guia de una carrera
 *     tags:
 *       - Carrera
 *     parameters:
 *       - in: path
 *         name: carreraId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la carrera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               docenteId:
 *                 type: integer
 *                 description: ID del docente a asignar como guia
 *     responses:
 *       200:
 *         description: Guia de carrera asignado exitosamente
 *       400:
 *         description: El docente ya está asignado como guia de otra carrera
 *       404:
 *         description: Carrera o docente no encontrado
 *       500:
 *         description: Error de servidor
 */
router.post(
  "/carreras/:carreraId/asignar-guia",
  authenticate(["administrador", "secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { carreraId } = req.params;
      const { docenteId } = req.body;

      if (!carreraId) {
        throw new AppError("El ID de la carrera es requerido", 400);
      }

      if (!docenteId) {
        throw new AppError("El ID del docente es requerido", 400);
      }

      const carreraActualizada = await asignarGuiaCarrera(carreraId, docenteId);
      res.status(200).json(carreraActualizada);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;