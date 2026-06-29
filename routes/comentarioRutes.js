const router = require("express").Router();

const {
    createComentario,
    updateComentario,
    getAllComentarios,
    deleteComentario,
    getComentario,
} = require("../controller/comentarioControler");
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
  "/comentarios",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
  async (req, res, next) => {
    try {
      const comentarios = await getAllComentarios();
      res.status(200).json(comentarios);
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
  "/comentarios/create",
  authenticate(["docente"]),
  async (req, res, next) => {
    try {
      const { docenteId,
            evaluacionId,
            contenido } = req.body;

      if (!docenteId || !evaluacionId || !contenido ) {
        throw new AppError("Todos los campos son requeridos", 400);
      }

      const comentario = await createComentario({
        docenteId: docenteId, 
        evaluacionId: evaluacionId, 
        contenido: contenido
      });
      res.status(201).json(comentario);
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
  "/comentarios/update/:comentarioId",
  authenticate(["docente"]),
  async (req, res, next) => {
    try {
      const { contenido } = req.body;
      const { comentarioId } = req.params;

      if (!comentarioId) {
        throw new AppError("El id del comentario es requerido", 400);
      }

      if (!contenido ) {
        throw new AppError("El contenido del comentario es requirido", 400);
      }

      const comentario = await updateComentario(comentarioId, contenido);
      if (comentario == 0) {
        throw new AppError("Comentario no encontrado", 404);
      }

      res.status(200).json({
        mensaje: "Comentario actualizado",
        comentarioId: comentarioId,
        contenido
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
  "/comentarios/delete/:comentarioId",
  authenticate(["docente"]),
  async (req, res, next) => {
    try {
      const { comentarioId } = req.params;

      if (!comentarioId) {
        throw new AppError("El id del comentario es requerido", 400);
      }

      const comentario = await deleteComentario(comentarioId);
      if (comentario == 0) {
        throw new AppError("Comentario no encontrado", 404);
      }

      res.status(200).json({ mensaje: "Comentario eliminado" });
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
  "/comentarios/:limit/:offset",
  authenticate(["docente"]),
  async (req, res, next) => {
    try {
      const limit = parseInt(req.params.limit) || 10;
      const offset = parseInt(req.params.offset) || 0;
      const comentarios = await getComentario(offset, limit);
      res.status(200).json({
        rows: comentarios.rows,
        count: comentarios.count
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 