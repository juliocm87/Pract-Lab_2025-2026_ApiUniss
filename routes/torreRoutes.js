const router = require("express").Router();

const {
  createTorre,
  updateTorre,
  getTorre,
  deleteTorre,
  verificarTorre,
  getAllTorres,
  getTorresByBeca
} = require("../controller/torreController");
const AppError = require("../error/AppError");
const authenticate = require("../middlewares/authenticate");

/**
 * @swagger
 * /torres:
 *   get:
 *     summary: Obtiene todas las torres sin paginación
 *     tags:
 *       - Torre
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de torres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Torres'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/torres",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const torres = await getAllTorres();
      res.status(200).json(torres);
    } catch (error) {
      next(error);
    }
  }
);


router.get(
  "/torres/beca/:becaId",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { becaId } = req.params;
      if (!becaId) {
        throw new AppError("El id de la beca es requerido", 400);
      }
      const torres = await getTorresByBeca(becaId);
    
      res.status(200).json(torres);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /torres/{limit}/{offset}:
 *   get:
 *     summary: Obtiene una lista paginada de torres con búsqueda opcional
 *     tags:
 *       - Torre
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de torres a obtener
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de torres a omitir
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar torres por nombre o beca
 *     responses:
 *       200:
 *         description: Lista paginada de torres
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Torres'
 *                 count:
 *                   type: integer
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/torres/:limit/:offset",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const limit = parseInt(req.params.limit) || 10;
      const offset = parseInt(req.params.offset) || 0;
      const searchTerm = req.query.search || '';
      const torres = await getTorre(offset, limit, searchTerm);
      res.status(200).json({
        rows: torres.rows,
        count: torres.count
      });
    } catch (error) {
      next(error);
    }
  }
);



/**
 * @swagger
 * /torres/create:
 *   post:
 *     summary: Crea una nueva torre
 *     tags:
 *       - Torre
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_torre:
 *                 type: string
 *                 description: Nombre de la torre
 *               becaId:
 *                 type: integer
 *                 description: ID de la beca asociada
 *             required:
 *               - nombre_torre
 *               - becaId
 *     responses:
 *       201:
 *         description: Torre creada exitosamente
 *       400:
 *         description: Todos los campos son requeridos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.post(
  "/torres/create",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const {nombre_torre, becaId } = req.body;
      console.log("gggggggggggggggggggggggggggggggggggggg")
      if ( !nombre_torre || !becaId) {
        throw new AppError("Todos los campos son requeridos", 400);
      }

      const torre = await createTorre(nombre_torre, becaId);
      res.status(201).json(torre);
    } catch (error) {
      next(error); //Error de servidor 500
    }
  }
);

/**
 * @swagger
 * /torres/update/{id}:
 *   put:
 *     summary: Actualiza una torre existente
 *     tags:
 *       - Torre
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la torre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_torre:
 *                 type: string
 *                 description: Nombre de la torre
 *               becaId:
 *                 type: integer
 *                 description: ID de la beca asociada
 *             required:
 *               - nombre_torre
 *               - becaId
 *     responses:
 *       200:
 *         description: Torre actualizada exitosamente
 *       400:
 *         description: El id es requerido o todos los campos son requeridos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Torre no encontrada
 *       500:
 *         description: Error de servidor
 */
router.put(
  "/torres/update/:id",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const {nombre_torre, becaId } = req.body;
      const { id } = req.params;

      if (!id) {
        throw new AppError("El id es requerido", 400);
      }

      if (!nombre_torre || !becaId) {
        throw new AppError("Todos los campos son requeridos", 400);
      }

      const torre = await updateTorre(id, nombre_torre, becaId);
      if (torre == 0) {
        throw new AppError("Torre no encontrada", 404);
      }

      res.status(200).json({
        mensaje: "Torre actualizada",
        id: id,
        nombre_torre,
          becaId,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /torres/delete/{id}:
 *   delete:
 *     summary: Elimina una torre
 *     tags:
 *       - Torre
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la torre
 *     responses:
 *       200:
 *         description: Torre eliminada exitosamente
 *       400:
 *         description: El id es requerido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Torre no encontrada
 *       500:
 *         description: Error de servidor
 */
router.delete(
  "/torres/delete/:id",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError("El id es requerido", 400);
      }

      await deleteTorre(id);
      res.status(200).json({ mensaje: "Torre eliminada exitosamente" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /torres/{id}/pisos:
 *   get:
 *     summary: Verifica si una torre tiene pisos asociados
 *     tags:
 *       - Torre
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la torre
 *     responses:
 *       200:
 *         description: Información sobre los pisos asociados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tienePisos:
 *                   type: boolean
 *                   description: Indica si la torre tiene pisos asociados
 *                 pisos:
 *                   type: array
 *                   description: Lista de pisos asociados
 *                   items:
 *                     $ref: '#/components/schemas/Pisos'
 *       400:
 *         description: El id es requerido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Torre no encontrada
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/torres/:id/pisos",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError("El id es requerido", 400);
      }

      const result = await verificarPisosAsociados(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/torres/verificar",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { nombre_torre, becaId } = req.body;

      if (!nombre_torre || !becaId) {
        throw new AppError("Todos los campos son requeridos", 400);
      }

      const existe = await verificarTorre(nombre_torre, becaId);
      res.status(200).json(existe);
    } catch (error) {
      next(error);
    }
  }
);


module.exports = router;
