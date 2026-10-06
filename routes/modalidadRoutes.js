const router = require("express").Router();

const {
    getAllModalidades,
    createModalidad,
    updateModalidad,
    deleteModalidad
} = require("../controller/modalidadController");
const AppError = require("../error/AppError");
const authenticate = require("../middlewares/authenticate")

/**
 * @swagger
 * tags:
 *   name: Modalidades
 *   description: Gestión de modalidades de actividades
 */

/**
 * @swagger
 * /modalidad:
 *   get:
 *     summary: Obtener todas las modalidades
 *     tags: [Modalidades]
 *     responses:
 *       200:
 *         description: Lista de modalidades
 *   post:
 *     summary: Crear una nueva modalidad
 *     tags: [Modalidades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Modalidad creada
 */
router.get(
    "/modalidad",
    authenticate(["docente"]),
    async (req, res, next) => {
        try {
            const modalidades = await getAllModalidades();
            res.status(200).json(modalidades);
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/modalidad",
    authenticate([]),
    async (req, res, next) => {
        try {
            const modalidad = await createModalidad(req.body);
            res.status(201).json(modalidad);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /modalidad/{id}:
 *   put:
 *     summary: Actualizar una modalidad
 *     tags: [Modalidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Modalidad actualizada
 *   delete:
 *     summary: Eliminar una modalidad
 *     tags: [Modalidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Modalidad eliminada
 */
router.put(
    "/modalidad/:id",
    authenticate([]),
    async (req, res, next) => {
        try {
            const modalidad = await updateModalidad(req.params.id, req.body);
            res.status(200).json(modalidad);
        } catch (error) {
            next(error);
        }
    }
);

router.delete(
    "/modalidad/:id",
    authenticate([]),
    async (req, res, next) => {
        try {
            await deleteModalidad(req.params.id);
            res.status(200).json({ message: "Modalidad eliminada correctamente" });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;