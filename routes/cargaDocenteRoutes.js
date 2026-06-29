const router = require("express").Router();

const {
    createCargaDocente,
    updateCargaDocente,
    deleteCargaDocente,
    getCargaDocentePorDocente,
    getCargaDocentePorDocenteFecha,
    getCargaDocentePorEstado,
    getTrabajadoresConCargaDocente,
    getTrabajadoresSinCargaDocente
} = require("../controller/cargaDocenteController");
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
    "/carga-docente/trabajadores-con-carga-docente/:mes/:anno",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const { mes, anno } = req.params;
            if (!mes || !anno ) {
                throw new AppError("Mes y año requeridos", 400);
            }
            const trabajadores = await getTrabajadoresConCargaDocente(mes, anno);
            res.status(201).json(trabajadores);
        } catch (error) {
            next(error);
        }
    }
)

router.get(
    "/carga-docente/trabajadores-sin-carga-docente/:mes/:anno",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const { mes, anno } = req.params;
            if (!mes || !anno ) {
                throw new AppError("Mes y año requeridos", 400);
            }
            const trabajadores = await getTrabajadoresSinCargaDocente(mes, anno);
            res.status(201).json(trabajadores);
        } catch (error) {
            next(error);
        }
    }
)

router.get(
    "/carga-docente/estado/:mes/:anno/:estado",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const { mes, anno, estado } = req.params;
            if (!mes || !anno || !estado) {
                throw new AppError("Todos los parametros son requeridos", 400);
            }
            const cargaDocente = await getCargaDocentePorEstado(mes, anno, estado);
            res.status(201).json(cargaDocente);
        } catch (error) {
            next(error);
        }
    }
)

router.get(
    "/carga-docente/docente/fecha/:mes/:anno/:docenteCI",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const { mes, anno, docenteCI } = req.params;
            if (!mes || !anno || !docenteCI) {
                throw new AppError("Todos los parametros son requeridos", 400);
            }
            const cargaDocente = await getCargaDocentePorDocenteFecha(mes, anno, docenteCI);
            res.status(201).json(cargaDocente);
        } catch (error) {
            next(error);
        }
    }
)

router.get(
    "/carga-docente/docente/:docenteCI",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const {docenteCI } = req.params;
            if (!docenteCI) {
                throw new AppError("CI del docente requerido", 400);
            }
            const cargaDocente = await getCargaDocentePorDocente(docenteCI);
            res.status(201).json(cargaDocente);
        } catch (error) {
            next(error);
        }
    }
)

router.post(
    "/carga-docente/create",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const { 
                docenteCI,
                anno,
                mes,
                estado,
                modalidad,
                total_horas,
                horas_sobrecarga,
            } = req.body;
            if (!docenteCI || !anno || !mes || !estado || !modalidad || !total_horas || !horas_sobrecarga ) {
                throw new AppError("Todos los campos son requeridos", 400);
            }
            const cargaDocente = await createCargaDocente({
                docenteCI,
                anno,
                mes,
                estado,
                modalidad,
                total_horas,
                horas_sobrecarga,
            });
            res.status(201).json(cargaDocente);
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
    "/carga-docente/update/:cargaDocenteId",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const { 
                docenteCI,
                anno,
                mes,
                estado,
                modalidad,
                total_horas,
                horas_sobrecarga,
            } = req.body;
            const { cargaDocenteId } = req.params;
            if (!cargaDocenteId) {
                throw new AppError("El id es requerido", 400);
            }
            if (!docenteCI || !anno || !mes || !estado || !modalidad || !total_horas || !horas_sobrecarga ) {
                throw new AppError("Todos los campos son requiridos", 400);
            }
            const cargaDocente = await updateCargaDocente(cargaDocenteActividadId, {
                docenteCI,
                anno,
                mes,
                estado,
                modalidad,
                total_horas,
                horas_sobrecarga,
            });
            if (cargaDocente == 0) {
                throw new AppError("CargaDocente no encontrada", 404);
            }
            res.status(200).json({
                mensaje: "CargaDocente actualizada",
                docenteCI,
                anno,
                mes,
                estado,
                modalidad,
                total_horas,
                horas_sobrecarga,
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
    "/carga-docente/delete/:cargaDocenteId",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca", "docente"]),
    async (req, res, next) => {
        try {
            const { cargaDocenteId } = req.params;
            if (!cargaDocenteId) {
                throw new AppError("El id es requerido", 400);
            }
            const cargaDocente = await deleteCargaDocente(cargaDocenteId);
            if (cargaDocente == 0) {
                throw new AppError("CargaDocente no encontrada", 404);
            }
            res.status(200).json({ mensaje: "CargaDocente eliminada" });
        } catch (error) {
            next(error);
        }
    }
);


module.exports = router; 