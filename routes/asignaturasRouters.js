//put actualizar
//post crear , realizar login
//get
//delete
const router = require("express").Router();
const AppError = require("../error/AppError");

const {
    createAsignatura,
    deleteAsignatura,
    getAsignatura,
    updateAsignatura,
    getAllAsignaturas,
    getAsignaturasPorSemestre,
} = require("../controller/asignaturaController");
const authenticate = require("../middlewares/authenticate");



/**
 * @swagger
 * /asignatura:
 *   get:
 *     summary: Obtiene una lista de asignaturas
 *     tags:
 *       - Asignatura
 *     responses:
 *       200:
 *         description: Lista de asignaturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *       500:
 *         description: Error de servidor
 */
router.get(
    "/asignaturas",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
    async (req, res, next) => {
        try {
            const asignaturas = await getAllAsignaturas();
            res.status(200).json(asignaturas);
        }catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /asignatura/{limit}/{offset}:
 *   get:
 *     summary: Obtiene una lista paginada de asignaturas con búsqueda opcional
 *     tags:
 *       - Asignatura
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de asignaturas a obtener
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de asignaturas a omitir
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar asignaturas por nombre o semestre
 *     responses:
 *       200:
 *         description: Lista paginada de asignaturas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                 count:
 *                   type: integer
 *       500:
 *         description: Error de servidor
 */
router.get(
    "/asignaturas/:limit/:offset",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
    async (req, res, next) => {
        try {
            const limit = parseInt(req.params.limit) || 10;
            const offset = parseInt(req.params.offset) || 0;
            const searchTerm = req.query.search || '';
            const asignaturas = await getAsignatura(offset, limit, searchTerm);
            res.status(200).json({
                rows: asignaturas.rows,
                count: asignaturas.count
            });
            } catch (error) {
                next(error);
            }
    }
);

/**
 * @swagger
 * /asignatura/{limit}/{offset}:
 *   get:
 *     summary: Obtiene una lista paginada de las asignaturas de una facultad y un semestre
 *     tags:
 *       - Asignatura
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de asignaturas a obtener
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de asignaturas a omitir
 *       - in: query
 *         name: facultad
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar asignaturas por facultad.
 *       - in: query
 *         name: semestre
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar asignaturas por semestre.
 *     responses:
 *       200:
 *         description: Lista paginada de asignaturas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                 count:
 *                   type: integer
 *       500:
 *         description: Error de servidor
 */

router.get(
    "/asignaturas/facultad/:limit/:offset",
    authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
    async (req, res, next) => {
        try {
            const limit = parseInt(req.params.limit) || 10;
            const offset = parseInt(req.params.offset) || 0;
            const facultad = req.query.facultad || '';
            const semestre = parseInt(req.query.semestre) || 1;
            const asignaturas = await getAsignaturasPorSemestre(limit,offset, facultad, semestre);
            res.status(200).json({
                rows: asignaturas.rows,
                count: asignaturas.count
            });
        } catch (error) {
                next(error);
            }
    }
);

/**
 * @swagger
 * /asignaturas/create:
 *   post:
 *     summary: Crea una nueva asignatura
 *     tags:
 *       - Asignatura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_asignatura:
 *                 type: string
 *              
 *     responses:
 *       201:
 *         description: Asignatura creada
 *       400:
 *         description: Todos los campos son requeridos
 *       500:
 *         description: Error de servidor
 */
router.post(
    "/asignaturas/create",
    authenticate(["administrador","secretaria_beca", "jefe_beca"]),
    async (req, res, next) => {
        try {
            const { nombre_asignatura} = req.body;
            if (!nombre_asignatura ) {
                throw new AppError("Todos los campos son requeridos", 400);
            }
            const asignatura = await createAsignatura(nombre_asignatura);
            res.status(201).json(asignatura);
        } catch (error) {
            if (error?.parent?.detail.includes("nombre_asignatura")) {
                return next(new AppError("Ya existe la asignatura", 400));
            }
            next(error); //Error de servidor 500
        }
    }
);

/**
 * @swagger
 * /asignaturas/update/{id}:
 *   put:
 *     summary: Actualiza una asignatura existente
 *     tags:
 *       - Asignatura
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la asignatura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_asignatura:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asignatura actualizada
 *       400:
 *         description: El id es requerido o todos los campos son requeridos
 *       404:
 *         description: Asignatura no encontrada
 *       500:
 *         description: Error de servidor
 */
router.put(
    "/asignaturas/update/:id",
    authenticate(["administrador","secretaria_beca", "jefe_beca"]),
    async (req, res, next) => {
        //:id es para rcibir parametros
        try {
            const { nombre_asignatura } = req.body;
            const { id } = req.params;

            if (!id) {
                throw new AppError("El id es requerido", 400);
            }

            if (!nombre_asignatura) {
                throw new AppError("Todos los campos son requeridos", 400);
            }
            const asignatura = await updateAsignatura(id, nombre_asignatura);
            if (asignatura == 0) {
                throw new AppError("Asignatura no encontrada", 404);
            }

            res.status(200).json({ mensaje: "Asignatura actualizada" });
        } catch (error) {
            if (error?.parent?.detail.includes("nombre_asignatura")) {
                return next(new AppError("Ya existe la asignatura", 400));
            }
            next(error); //Error de servidor 500
        }
    }
);

/**
 * @swagger
 * /asignaturas/delete/{id}:
 *   delete:
 *     summary: Elimina una asignatura
 *     tags:
 *       - Asignatura
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la asignatura
 *     responses:
 *       200:
 *         description: Asignatura eliminada
 *       400:
 *         description: El id es requerido
 *       404:
 *         description: Asignatura no encontrada
 *       500:
 *         description: Error de servidor
 */
router.delete(
    "/asignaturas/delete/:id",
    authenticate(["administrador","secretaria_beca", "jefe_beca"]),
    async (req, res, next) => {
        try {
            const { id } = req.params;

            if (!id) {
                throw new AppError("El id es requerido", 400);
            }

            const asignatura = await deleteAsignatura(id);
            if (asignatura == 0) {
                throw new AppError("Asignatura no encontrada", 404);
            }

            res.status(200).json({ mensaje: "Asignatura eliminada" });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
