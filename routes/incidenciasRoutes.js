const router = require("express").Router();

const {
  createIncidencia,
  updateIncidencia,
  getIncidencia,
  deleteIncidencia,
  getIncidenciaPaginada,
} = require("../controller/incidenciaController");
const AppError = require("../error/AppError");
const authenticate = require("../middlewares/authenticate");

/**
 * @swagger
 * /incidencias:
 *   get:
 *     summary: Obtiene una lista de incidencias
 *     tags:
 *       - Incidencias
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de incidencias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Incidencias'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/incidencias",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const incidencias = await getIncidencia();
      res.status(200).json(incidencias);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /incidencias/create:
 *   post:
 *     summary: Crea una nueva incidencia
 *     tags:
 *       - Incidencias
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 description: Tipo de la incidencia
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada de la incidencia
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de la incidencia
 *               cis:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de carnets de identidad de los estudiantes implicados
 *               enviarEmail:
 *                 type: boolean
 *                 description: Si se debe enviar correo de notificación
 *                 default: false
 *             required:
 *               - tipo
 *               - descripcion
 *               - fecha
 *               - cis
 *     responses:
 *       201:
 *         description: Incidencia creada exitosamente
 *       400:
 *         description: Todos los campos son requeridos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.post(
  "/incidencias/create",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { tipo, descripcion, fecha, cis, enviarEmail = false } = req.body;

      if (!tipo || !descripcion || !fecha || !cis || !Array.isArray(cis) || cis.length === 0) {
        throw new AppError("Todos los campos son requeridos y debe haber al menos un CI", 400);
      }

      const incidencia = await createIncidencia(tipo, descripcion, fecha, cis, enviarEmail);
      res.status(201).json(incidencia);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /incidencias/update/{id}:
 *   put:
 *     summary: Actualiza una incidencia existente
 *     tags:
 *       - Incidencias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la incidencia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 description: Tipo de la incidencia
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada de la incidencia
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de la incidencia
 *               cis:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de carnets de identidad de los estudiantes implicados
 *               enviarEmail:
 *                 type: boolean
 *                 description: Si se debe enviar correo de notificación
 *                 default: false
 *             required:
 *               - tipo
 *               - descripcion
 *               - fecha
 *               - cis
 *     responses:
 *       200:
 *         description: Incidencia actualizada exitosamente
 *       400:
 *         description: El id es requerido o todos los campos son requeridos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Incidencia no encontrada
 *       500:
 *         description: Error de servidor
 */
router.put(
  "/incidencias/update/:incidenciaId",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { tipo, descripcion, fecha, cis, enviarEmail = false } = req.body;
      const { incidenciaId } = req.params;

      if (!incidenciaId) {
        throw new AppError("El id de la incidencia es requerido", 400);
      }

      if (!tipo || !descripcion || !fecha || !cis || !Array.isArray(cis) || cis.length === 0) {
        throw new AppError("Todos los campos son requeridos y debe haber al menos un CI", 400);
      }

      const incidencia = await updateIncidencia(incidenciaId, tipo, descripcion, fecha, cis, enviarEmail);
      if (incidencia == 0) {
        throw new AppError("Incidencia no encontrada", 404);
      }

      res.status(200).json({
        mensaje: "Incidencia actualizada",
        incidenciaId: incidenciaId,
        tipo,
        descripcion,
        fecha,
        cis
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /incidencias/delete/{id}:
 *   delete:
 *     summary: Elimina una incidencia
 *     tags:
 *       - Incidencias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la incidencia
 *     responses:
 *       200:
 *         description: Incidencia eliminada exitosamente
 *       400:
 *         description: El id es requerido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Incidencia no encontrada
 *       500:
 *         description: Error de servidor
 */
router.delete(
  "/incidencias/delete/:incidenciaId",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { incidenciaId } = req.params;

      if (!incidenciaId) {
        throw new AppError("El id de la incidencia es requerido", 400);
      }

      const incidencia = await deleteIncidencia(incidenciaId);
      if (incidencia == 0) {
        throw new AppError("Incidencia no encontrada", 404);
      }

      res.status(200).json({ mensaje: "Incidencia eliminada" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /incidencias/{limit}/{offset}:
 *   get:
 *     summary: Obtiene una lista paginada de incidencias
 *     tags:
 *       - Incidencias
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de incidencias a obtener
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de incidencias a omitir
 *     responses:
 *       200:
 *         description: Lista paginada de incidencias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/incidencias/:limit/:offset",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const limit = parseInt(req.params.limit) || 10;
      const offset = parseInt(req.params.offset) || 0;
      const incidencias = await getIncidenciaPaginada(offset, limit);
      res.status(200).json({
        rows: incidencias.rows,
        count: incidencias.count
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 