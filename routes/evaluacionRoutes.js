const router = require("express").Router();

const {
    createEvaluacion,
    updateEvaluacion,
    getAllEvaluacion,
    deleteEvaluacion,
    getEvaluacion,
} = require("../controller/evaluacionController");
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
    "/evaluaciones",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const evaluaciones = await getAllEvaluacion();
            res.status(200).json(evaluaciones);
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
    "/evaluaciones/create/:jefeId",
    authenticate(["docente"]),
    async (req, res, next) => {
        try {
            const {jefeId} = req.params;
            const { 
                tesisId,
                tribunalId,
                taller,
                nota
            } = req.body;
            if (!tesisId || !tribunalId || !taller || !nota ) {
                throw new AppError("Todos los campos son requeridos", 400);
            }
            const evaluacion = await createEvaluacion(jefeId, {
                tesisId: tesisId,
                tribunalId: tribunalId,
                taller: taller,
                nota: nota
            });
            res.status(201).json(evaluacion);
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
    "/evaluaciones/update/:evaluacionId/:jefeId",
    authenticate(["docente"]),
    async (req, res, next) => {
        try {
            const { nota } = req.body;
            const { evaluacionId, jefeId } = req.params;
            if (!evaluacionId || !jefeId) {
                throw new AppError("Ambos ids son requeridos", 400);
            }
            if (!nota ) {
                throw new AppError("La nota de la evaluación es requirida", 400);
            }
            const evaluacion = await updateEvaluacion(evaluacionId, jefeId, nota);
            if (evaluacion == 0) {
                throw new AppError("Evaluación no encontrada", 404);
            }
            res.status(200).json({
                mensaje: "Evaluación actualizada",
                evaluacionId: evaluacionId,
                nota: nota
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
    "/evaluaciones/delete/:evaluacionId",
    authenticate(["docente"]),
    async (req, res, next) => {
        try {
            const { evaluacionId } = req.params;
            if (!evaluacionId) {
                throw new AppError("El id de la evaluacion es requerido", 400);
            }
            const evaluacion = await deleteEvaluacion(evaluacionId);
            if (evaluacion == 0) {
                throw new AppError("Evaluación no encontrada", 404);
            }
            res.status(200).json({ mensaje: "Evaluación eliminada" });
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
            const evaluaciones = await getEvaluacion(offset, limit);
            res.status(200).json({
                rows: evaluaciones.rows,
                count: evaluaciones.count
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router; 