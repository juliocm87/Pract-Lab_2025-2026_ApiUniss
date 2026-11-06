const router = require("express").Router();
const {
  createPiso,
  deletePiso,
  getPiso,
  updatePiso,
  verificarPiso,
  getAllPisos,
  getPisoPaginated,
  getPisosByTorre
} = require("../controller/pisoController");
const AppError = require("../error/AppError");
const authenticate = require("../middlewares/authenticate");

/**
 * @swagger
 * /pisos:
 *   get:
 *     summary: Obtiene todas las torres sin paginación
 *     tags:
 *       - Pisos
 *     responses:
 *       200:
 *         description: Lista completa de pisos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pisos'
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/pisos",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const pisos = await getAllPisos();
      res.status(200).json(pisos);
    } catch (error) {
      next(error); //Error de servidor 500
    }
  }
);

/**
 * @swagger
 * /pisos/torre/{torreId}:
 *   get:
 *     summary: Obtiene todos los pisos de una torre específica
 *     tags:
 *       - Pisos
 *     parameters:
 *       - in: path
 *         name: torreId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la torre
 *     responses:
 *       200:
 *         description: Lista de pisos de la torre
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pisos'
 *       400:
 *         description: El ID de la torre es requerido
 *       404:
 *         description: No se encontraron pisos para esta torre
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/pisos/torre/:torreId",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { torreId } = req.params;

      if (!torreId) {
        throw new AppError("El ID de la torre es requerido", 400);
      }

      const pisos = await getPisosByTorre(torreId);
      
     

      res.status(200).json(pisos);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /pisos/{limit}/{offset}:
 *   get:
 *     summary: Obtiene una lista paginada de pisos con búsqueda opcional
 *     tags:
 *       - Pisos
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de pisos a obtener
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de pisos a omitir
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar pisos por número, torre, beca o supervisor
 *     responses:
 *       200:
 *         description: Lista paginada de pisos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pisos'
 *                 count:
 *                   type: integer
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/pisos/:limit/:offset",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const limit = parseInt(req.params.limit) || 10;
      const offset = parseInt(req.params.offset) || 0;
      const searchTerm = req.query.search || '';
      const pisos = await getPisoPaginated(offset, limit, searchTerm);
      res.status(200).json({
        rows: pisos.rows,
        count: pisos.count
      });
    } catch (error) {
      next(error); //Error de servidor 500
    }
  }
);



/**
 * @swagger
 * /pisos/create:
 *   post:
 *     summary: Crea un nuevo piso
 *     tags:
 *       - Piso
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero_piso:
 *                 type: integer
 *                 description: Número del piso
 *               torreId:
 *                 type: integer
 *                 description: ID de la torre asociada
 *             required:
 *               - numero_piso
 *               - torreId
 *     responses:
 *       201:
 *         description: Piso creado exitosamente
 *       400:
 *         description: Todos los campos son requeridos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.post(
  "/pisos/create",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { numero_piso, torreId } = req.body;

      if (!numero_piso || !torreId) {
        throw new AppError("Todos los campos son requeridos", 400);
      }

      // Verificar si el piso ya existe en la misma torre
      const existe = await verificarPiso(numero_piso, torreId);
      if (existe) {
        throw new AppError("Ya existe un piso con ese número en esta torre", 400);
      }

      const piso = await createPiso(numero_piso, torreId);
      res.status(201).json(piso);
    } catch (error) {
      next(error); //Error de servidor 500
    }
  }
);

/**
 * @swagger
 * /pisos/verificar:
 *   post:
 *     summary: Verifica si existe un piso con el mismo número en la misma torre
 *     tags:
 *       - Piso
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero_piso:
 *                 type: integer
 *                 description: Número del piso
 *               torreId:
 *                 type: integer
 *                 description: ID de la torre asociada
 *             required:
 *               - numero_piso
 *               - torreId
 *     responses:
 *       200:
 *         description: Indica si existe el piso
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 *       400:
 *         description: Campos requeridos faltantes
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.post(
  "/pisos/verificar",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { numero_piso, torreId } = req.body;

      if (!numero_piso || !torreId) {
        throw new AppError("Todos los campos son requeridos", 400);
      }

      const existe = await verificarPiso(numero_piso, torreId);
      res.status(200).json(existe);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /pisos/update/{id}:
 *   put:
 *     summary: Actualiza un piso existente
 *     tags:
 *       - Piso
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del piso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero_piso:
 *                 type: integer
 *                 description: Número del piso
 *               torreId:
 *                 type: integer
 *                 description: ID de la torre asociada
 *             required:
 *               - numero_piso
 *               - torreId
 *     responses:
 *       200:
 *         description: Piso actualizado exitosamente
 *       400:
 *         description: El id es requerido o todos los campos son requeridos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Piso no encontrado
 *       500:
 *         description: Error de servidor
 */
router.put(
  "/pisos/update/:id",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { numero_piso, torreId } = req.body;
      const { id } = req.params;

      if (!id) {
        throw new AppError("El id es requerido", 400);
      }

      if (!numero_piso || !torreId) {
        throw new AppError("Todos los campos son requeridos", 400);
      }

      const piso = await updatePiso(id, numero_piso, torreId);
      if (piso == 0) {
        throw new AppError("Piso no encontrado", 404);
      }

      res.status(200).json({
        mensaje: "Piso actualizado",
        id: id,
        numero_piso,
        torreId,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /pisos/delete/{id}:
 *   delete:
 *     summary: Elimina un piso
 *     tags:
 *       - Piso
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del piso
 *     responses:
 *       200:
 *         description: Piso eliminado exitosamente
 *       400:
 *         description: El id es requerido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Piso no encontrado
 *       500:
 *         description: Error de servidor
 */
router.delete(
  "/pisos/delete/:id",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError("El id es requerido", 400);
      }

      const piso = await deletePiso(id);
      if (piso == 0) {
        throw new AppError("Piso no encontrado", 404);
      }

      res.status(200).json({ mensaje: "Piso eliminado " });
    } catch (error) {
      next(error); //Error de servidor 500
    }
  }
);

module.exports = router;
