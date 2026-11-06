//put actualizar
//post crear , realizar login
//get
//delete
const router = require("express").Router();
const AppError = require("../error/AppError");

const {
  createBeca,
  deleteBeca,
  getBeca,
  updateBeca,
  getAllBecas,
  getCapacidadBecas,
  asignarJefeBeca,
} = require("../controller/becaController");
const authenticate = require("../middlewares/authenticate");



/**
 * @swagger
 * /becas:
 *   get:
 *     summary: Obtiene una lista de becas
 *     tags:
 *       - Beca
 *     responses:
 *       200:
 *         description: Lista de becas
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
  "/becas",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const becas = await getAllBecas();
      res.status(200).json(becas);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /becas/{limit}/{offset}:
 *   get:
 *     summary: Obtiene una lista paginada de becas con búsqueda opcional
 *     tags:
 *       - Beca
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de becas a obtener
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de becas a omitir
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar becas por nombre o jefe de beca
 *     responses:
 *       200:
 *         description: Lista paginada de becas
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
  "/becas/:limit/:offset",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const limit = parseInt(req.params.limit) || 10;
      const offset = parseInt(req.params.offset) || 0;
      const searchTerm = req.query.search || '';
      const becas = await getBeca(offset, limit, searchTerm);
      res.status(200).json({
        rows: becas.rows,
        count: becas.count
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /becas/create:
 *   post:
 *     summary: Crea una nueva beca
 *     tags:
 *       - Beca
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_beca:
 *                 type: string
 *              
 *     responses:
 *       201:
 *         description: Beca creada
 *       400:
 *         description: Todos los campos son requeridos
 *       500:
 *         description: Error de servidor
 */
router.post(
  "/becas/create",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { nombre_beca} = req.body;

      if (!nombre_beca ) {
        throw new AppError("Todos los campos son requeridos", 400);
      }
      const beca = await createBeca(nombre_beca);
      res.status(201).json(beca);
    } catch (error) {
      if (error?.parent?.detail.includes("nombre_beca")) {
        return next(new AppError("Ya existe la beca", 400));
      }
      next(error); //Error de servidor 500
    }
  }
);

/**
 * @swagger
 * /becas/update/{id}:
 *   put:
 *     summary: Actualiza una beca existente
 *     tags:
 *       - Beca
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la beca
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_beca:
 *                 type: string
 *     responses:
 *       200:
 *         description: Beca actualizada
 *       400:
 *         description: El id es requerido o todos los campos son requeridos
 *       404:
 *         description: Beca no encontrada
 *       500:
 *         description: Error de servidor
 */
router.put(
  "/becas/update/:id",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    //:id es para rcibir parametros
    try {
      const { nombre_beca } = req.body;
      const { id } = req.params;

      if (!id) {
        throw new AppError("El id es requerido", 400);
      }

      if (!nombre_beca) {
        throw new AppError("Todos los campos son requeridos", 400);
      }
      const beca = await updateBeca(id, nombre_beca);
      if (beca == 0) {
        throw new AppError("Usuario no encontrado", 404);
      }

      res.status(200).json({ mensaje: "Usuario actualizado " });
    } catch (error) {
      if (error?.parent?.detail.includes("nombre_beca")) {
        return next(new AppError("Ya existe la beca", 400));
      }
      next(error); //Error de servidor 500
    }
  }
);

/**
 * @swagger
 * /becas/delete/{id}:
 *   delete:
 *     summary: Elimina una beca
 *     tags:
 *       - Beca
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la beca
 *     responses:
 *       200:
 *         description: Beca eliminada
 *       400:
 *         description: El id es requerido
 *       404:
 *         description: Beca no encontrada
 *       500:
 *         description: Error de servidor
 */
router.delete(
  "/becas/delete/:id",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError("El id es requerido", 400);
      }

      const beca = await deleteBeca(id);
      if (beca == 0) {
        throw new AppError("Beca no encontrada", 404);
      }

      res.status(200).json({ mensaje: "Beca eliminada" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /capacidad/becas/:
 *   get:
 *     summary: Obtiene la capacidad disponible y ocupada de cada beca
 *     tags:
 *       - Beca
 *     responses:
 *       200:
 *         description: Lista de becas con capacidad disponible y ocupada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nombre_beca:
 *                     type: string
 *                   capacidad_disponible:
 *                     type: integer
 *                   capacidad_ocupada:
 *                     type: integer
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/capacidad/becas/",
  async (req, res, next) => {
    try {
      const capacidades = await getCapacidadBecas();
      res.status(200).json(capacidades);
    } catch (error) {
      next(error);
    }
  }
);




/**
 * @swagger
 * /becas/{becaId}/asignar-jefe:
 *   post:
 *     summary: Asigna un trabajador como jefe de una beca
 *     tags:
 *       - Beca
 *     parameters:
 *       - in: path
 *         name: becaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la beca
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trabajadorId:
 *                 type: integer
 *                 description: ID del trabajador a asignar como jefe
 *     responses:
 *       200:
 *         description: Jefe de beca asignado exitosamente
 *       400:
 *         description: El trabajador ya está asignado como jefe de otra beca
 *       404:
 *         description: Beca o trabajador no encontrado
 *       500:
 *         description: Error de servidor
 */
router.post(
  "/becas/:becaId/asignar-jefe",
  authenticate(["administrador", "secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { becaId } = req.params;
      const { trabajadorId } = req.body;

      if (!becaId) {
        throw new AppError("El ID de la beca es requerido", 400);
      }

      if (!trabajadorId) {
        throw new AppError("El ID del trabajador es requerido", 400);
      }

      const becaActualizada = await asignarJefeBeca(becaId, trabajadorId);
      res.status(200).json(becaActualizada);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;