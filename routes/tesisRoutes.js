const router = require("express").Router();

const {
    createTesis,
    updateTesis,
    getAllTesis,
    deleteTesis,
    getTesis,
} = require("../controller/tesisController");
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
    "/tesis",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const tesis = await getAllTesis();
            res.status(200).json(tesis);
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
    "/tesis/create/",
    authenticate(["docente"]),
    async (req, res, next) => {
        try {
            const { 
                tema,
                descripcion,
                docenteCI,
                estudianteCi
            } = req.body;
            if (!tema || !descripcion || !docenteCI || !estudianteCi ) {
                throw new AppError("Todos los campos son requeridos", 400);
            }
            const tesis = await createEvaluacion(jefeId, {
                tema: tema,
                descripcion: descripcion,
                docenteCI: docenteCI,
                estudianteCi: estudianteCi
            });
            res.status(201).json(tesis);
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
    "/tesis/update/:tesisId",
    authenticate(["docente"]),
    async (req, res, next) => {
        try {
            const { 
                tema,
                descripcion,
                estudianteCi } = req.body;
            const { tesisId } = req.params;
            if (!tesisId || !jefeId) {
                throw new AppError("El id de la tesis es requerido", 400);
            }
            if (!tema || !descripcion || !estudianteCi) {
                throw new AppError("Todos los campos son requiridos", 400);
            }
            const tesis = await updateTesis(tesisId, {
                tema: tema,
                descripcion: descripcion,
                estudianteCi: estudianteCi
            });
            if (tesis == 0) {
                throw new AppError("Tesis no encontrada", 404);
            }
            res.status(200).json({
                mensaje: "Tesis actualizada",
                tesis: tesis,
                tema: tema,
                descripcion: descripcion,
                estudianteCi: estudianteCi
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
    "/tesis/delete/:tesisId",
    authenticate(["docente"]),
    async (req, res, next) => {
        try {
            const { tesisId } = req.params;
            if (!tesisId) {
                throw new AppError("El id de la tesis es requerido", 400);
            }
            const tesis = await deleteTesis(tesisId);
            if (tesis == 0) {
                throw new AppError("Tesis no encontrada", 404);
            }
            res.status(200).json({ mensaje: "Tesis eliminada" });
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
    "/tesis/:limit/:offset",
    authenticate(["docente"]),
    async (req, res, next) => {
        try {
            const limit = parseInt(req.params.limit) || 10;
            const offset = parseInt(req.params.offset) || 0;
            const tesis = await getTesis(offset, limit);
            res.status(200).json({
                rows: tesis.rows,
                count: tesis.count
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router; 