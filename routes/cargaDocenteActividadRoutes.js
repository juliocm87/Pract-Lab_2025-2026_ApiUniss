const router = require("express").Router();

const {
    createCargaDocenteActividad,
    updateCargaDocenteActividad,
    deleteCargaDocenteActividad,
    getActividadesPorCargaDocente
} = require("../controller/cargaDocenteActividadController");
const AppError = require("../error/AppError");
const authenticate = require("../middlewares/authenticate");

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

router.get(
    "/carga-docente-actividad/:cargaDocente",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const { cargaDocente } = req.params;
            if (!cargaDocente ) {
                throw new AppError("CargaDocente requerida", 400);
            }
            const actividades = await getActividadesPorCargaDocente(cargaDocente);
            res.status(201).json(actividades);
        } catch (error) {
            next(error);
        }
    }
)

router.post(
    "/carga-docente-actividad/create",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const { 
                actividadId,
                cargaDocenteId,
                horas
            } = req.body;
            if (!actividadId || !cargaDocenteId || !horas ) {
                throw new AppError("Todos los campos son requeridos", 400);
            }
            const cargaDocenteActividad = await createCargaDocenteActividad({
                actividadId: actividadId,
                cargaDocenteId: cargaDocenteId,
                horas: horas
            });
            res.status(201).json(cargaDocenteActividad);
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
    "/carga-docente-actividad/update/:cargaDocenteActividadId",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const { 
                actividadId,
                cargaDocenteId,
                horas
            } = req.body;
            const { cargaDocenteActividadId } = req.params;
            if (!cargaDocenteActividadId) {
                throw new AppError("El id es requerido", 400);
            }
            if (!actividadId || !cargaDocenteId || !horas ) {
                throw new AppError("Todos los campos son requiridos", 400);
            }
            const cargaDocenteActividad = await updateCargaDocenteActividad(cargaDocenteActividadId, {
                actividadId: actividadId,
                cargaDocenteId: cargaDocenteId,
                horas: horas
            });
            if (cargaDocenteActividad == 0) {
                throw new AppError("CargaDocenteActividad no encontrada", 404);
            }
            res.status(200).json({
                mensaje: "CargaDocenteActividad actualizada",
                cargaDocenteActividadId: cargaDocenteActividadId,
                actividadId: actividadId,
                cargaDocenteId: cargaDocenteId,
                horas: horas
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
    "/carga-docente-actividad/delete/:cargaDocenteActividadId",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const { cargaDocenteActividadId } = req.params;
            if (!cargaDocenteActividadId) {
                throw new AppError("El id es requerido", 400);
            }
            const cargaDocenteActividad = await deleteCargaDocenteActividad(cargaDocenteActividadId);
            if (cargaDocenteActividad == 0) {
                throw new AppError("CargaDocenteActividad no encontrada", 404);
            }
            res.status(200).json({ mensaje: "CargaDocenteActividad eliminada" });
        } catch (error) {
            next(error);
        }
    }
);


module.exports = router; 