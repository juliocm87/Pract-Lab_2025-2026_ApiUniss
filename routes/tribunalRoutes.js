const router = require("express").Router();

const {
    createTribunal,
    updateTribunal,
    getAllTribunales,
    deleteTribunal,
    getTribunal,
} = require("../controller/tribunalController");
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
    "/tribunales",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const tribunales = await getAllTribunales();
            res.status(200).json(tribunales);
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
    "/tribunales/create",
    authenticate(["decano"]),
    async (req, res, next) => {
        try {
            const { 
                jefe, 
                secretario, 
                vocal,
                tutor,
                oponente
            } = req.body;
            if (!jefe || !secretario || !vocal || !tutor || !oponente) {
                throw new AppError("Todos los campos son requeridos", 400);
            }
            const tribunal = await createTribunal({
                jefe: jefe, 
                secretario: secretario,
                vocal: vocal,
                tutor: tutor,
                oponente: oponente
            });
            res.status(201).json(tribunal);
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
    "/tribunales/update/:tribunalId",
    authenticate(["decano"]),
    async (req, res, next) => {
        try {
            const { 
                jefe, 
                secretario, 
                vocal,
                tutor,
                oponente 
            } = req.body;
            const { tribunalId } = req.params;
            if (!tribunalId) {
                throw new AppError("El id del tribunal es requerido", 400);
            }
            if (!jefe || !secretario || !vocal || !tutor || !oponente) {
                throw new AppError("Todos los campos son requiridos", 400);
            }
            const tribunal = await updateTribunal(tribunalId, {
                jefe: jefe, 
                secretario: secretario,
                vocal: vocal,
                tutor: tutor,
                oponente: oponente
            });
            if (tribunal == 0) {
                throw new AppError("Tribunal no encontrado", 404);
            }
            res.status(200).json({
                mensaje: "Tribunal actualizado",
                tribunalId: tribunalId,
                jefe: jefe, 
                secretario: secretario,
                vocal: vocal,
                tutor: tutor,
                oponente: oponente
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
    "/tribunales/delete/:tribunalId",
    authenticate(["docente"]),
    async (req, res, next) => {
        try {
            const { tribunalId } = req.params;
            if (!tribunalId) {
                throw new AppError("El id del tribunal es requerido", 400);
            }
            const tribunal = await deleteTribunal(tribunalId);
            if (tribunal == 0) {
                throw new AppError("Tribunal no encontrado", 404);
            }
            res.status(200).json({ mensaje: "Tribunal eliminado" });
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
    "/tribunales/:limit/:offset",
    authenticate(["docente"]),
    async (req, res, next) => {
        try {
            const limit = parseInt(req.params.limit) || 10;
            const offset = parseInt(req.params.offset) || 0;
            const tribunales = await getAllTribunales(offset, limit);
            res.status(200).json({
                rows: tribunales.rows,
                count: tribunales.count
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router; 