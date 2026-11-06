const router = require("express").Router();
const Cuarto = require("../models/cuartos");
const {
  createCuarto,
  deleteCuarto,
  getCuarto,
  updateCuarto,
  getCuartosPorPiso,
  verificarTrabajadoresEnCuarto,
  getEstudiantesPorCuarto,
  getAllCuartos,
  getCuartoPaginated,
  getCuartosByPiso,
  asignarCuartoAutomatico,
  reubicarOcupantes,
} = require("../controller/cuartoController");
const AppError = require("../error/AppError");
const authenticate = require("../middlewares/authenticate");
/**
 * @swagger
 * /cuartos:
 *   get:
 *     summary: Obtiene todas las torres sin paginación
 *     tags:
 *       - Cuarto
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de cuartos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cuartos'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/cuartos",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const cuartos = await getAllCuartos();
      res.status(200).json(cuartos);
    } catch (error) {
      next(error); //Error de servidor 500
    }
  }
);


/**
 * @swagger
 * /cuartos/piso/{pisoId}:
 *   get:
 *     summary: Obtiene todos los cuartos de un piso específico
 *     tags:
 *       - Cuarto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pisoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del piso
 *     responses:
 *       200:
 *         description: Lista de cuartos del piso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cuartos'
 *       400:
 *         description: El ID del piso es requerido
 *       404:
 *         description: No se encontraron cuartos para este piso
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/cuartos/piso/:pisoId",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { pisoId } = req.params;

      if (!pisoId) {
        throw new AppError("El ID del piso es requerido", 400);
      }

      const cuartos = await getCuartosByPiso(pisoId);
      
     

      res.status(200).json(cuartos);
    } catch (error) {
      next(error);
    }
  }
); 

/**
 * @swagger
 * /cuartos/piso/{pisoId}/{genero}:
 *   get:
 *     summary: Obtiene todos los cuartos de un piso específico filtrados por género
 *     tags:
 *       - Cuarto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pisoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del piso
 *       - in: path
 *         name: genero
 *         required: true
 *         schema:
 *           type: string
 *         enum: [masculino, femenino]
 *         description: Género de los cuartos (masculino o femenino)
 *     responses:
 *       200:
 *         description: Lista de cuartos del piso filtrados por género
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cuartos'
 *       400:
 *         description: El ID del piso es requerido o el género debe ser 'masculino' o 'femenino'
 *       404:
 *         description: No se encontraron cuartos para este piso y género
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/cuartos/piso/:pisoId/:genero",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { pisoId, genero } = req.params;

      if (!pisoId) {
        throw new AppError("El ID del piso es requerido", 400);
      }

      if (!genero || !['masculino', 'femenino'].includes(genero)) {
        throw new AppError("El género debe ser 'masculino' o 'femenino'", 400);
      }

      const cuartos = await getCuartosByPiso(pisoId, genero);

      res.status(200).json(cuartos);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /cuartos/create:
 *   post:
 *     summary: Crea un nuevo cuarto
 *     tags:
 *       - Cuarto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero_cuarto:
 *                 type: integer
 *                 description: Número del cuarto
 *               capacidad_maxima:
 *                 type: integer
 *                 description: Capacidad máxima del cuarto
 *               genero:
 *                 type: string
 *                 enum: [masculino, femenino]
 *                 description: Género asignado al cuarto
 *               pisoId:
 *                 type: integer
 *                 description: ID del piso asociado
 *             required:
 *               - numero_cuarto
 *               - capacidad_maxima
 *               - genero
 *               - pisoId
 *     responses:
 *       201:
 *         description: Cuarto creado exitosamente
 *       400:
 *         description: Todos los campos son requeridos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.post(
  "/cuartos/create",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { numero_cuarto, capacidad_maxima, genero, pisoId } = req.body;


      if (!numero_cuarto || !capacidad_maxima || !genero || !pisoId) {
        throw new AppError("Todos los campos son requeridos", 400);
      }

      // Validar que el género sea válido
      if (!['masculino', 'femenino'].includes(genero)) {
        throw new AppError("El género debe ser 'masculino' o 'femenino'", 400);
      }

      const cuarto = await createCuarto(
        numero_cuarto,
        capacidad_maxima,
        genero,
        pisoId
      );
      res.status(201).json(cuarto);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /cuartos/update/{id}:
 *   put:
 *     summary: Actualiza un cuarto existente
 *     tags:
 *       - Cuarto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cuarto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero_cuarto:
 *                 type: integer
 *                 description: Número del cuarto
 *               capacidad_maxima:
 *                 type: integer
 *                 description: Capacidad máxima del cuarto
 *               genero:
 *                 type: string
 *                 enum: [masculino, femenino]
 *                 description: Género asignado al cuarto
 *               pisoId:
 *                 type: integer
 *                 description: ID del piso asociado
 *             required:
 *               - numero_cuarto
 *               - capacidad_maxima
 *               - genero
 *               - pisoId
 *     responses:
 *       200:
 *         description: Cuarto actualizado exitosamente
 *       400:
 *         description: El id es requerido o todos los campos son requeridos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cuarto no encontrado
 *       500:
 *         description: Error de servidor
 */
router.put(
  "/cuartos/update/:id",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { numero_cuarto, capacidad_maxima, genero, pisoId } = req.body;
      const { id } = req.params;

      if (!id) {
        throw new AppError("El id es requerido", 400);
      }

      if (!numero_cuarto || !capacidad_maxima || !genero || !pisoId) {
        throw new AppError("Todos los campos son requeridos", 400);
      }

      // Validar que el género sea válido
      if (!['masculino', 'femenino'].includes(genero)) {
        throw new AppError("El género debe ser 'masculino' o 'femenino'", 400);
      }

      const cuartoActualizado = await updateCuarto(
        id,
        numero_cuarto,
        capacidad_maxima,
        genero,
        pisoId
      );

      if (!cuartoActualizado) {
        throw new AppError("Cuarto no encontrado", 404);
      }

      res.status(200).json(cuartoActualizado);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /cuartos/delete/{id}:
 *   delete:
 *     summary: Elimina un cuarto
 *     tags:
 *       - Cuarto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cuarto
 *     responses:
 *       200:
 *         description: Cuarto eliminado exitosamente
 *       400:
 *         description: El id es requerido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cuarto no encontrado
 *       500:
 *         description: Error de servidor
 */
router.delete(
  "/cuartos/delete/:id",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    //:id es para recibir parámetros
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError("El id es requerido", 400);
      }

      const cuarto = await deleteCuarto(id);
      if (cuarto == 0) {
        throw new AppError("Cuarto no encontrado", 404);
      }

      res.status(200).json({ mensaje: "Cuarto eliminado " });
    } catch (error) {
      next(error); //Error de servidor 500
    }
  }
);

/**
 * @swagger
 * /cuartos/{limit}/{offset}:
 *   get:
 *     summary: Obtiene una lista paginada de cuartos
 *     tags:
 *       - Cuarto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de cuartos a obtener
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de cuartos a omitir
 *     responses:
 *       200:
 *         description: Lista paginada de cuartos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cuartos'
 *                 count:
 *                   type: integer
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/cuartos/:limit/:offset",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const limit = parseInt(req.params.limit) || 10;
      const offset = parseInt(req.params.offset) || 0;
      const cuartos = await getCuartoPaginated(offset, limit);
      res.status(200).json({
        rows: cuartos.rows,
        count: cuartos.count
      });
    } catch (error) {
      next(error); //Error de servidor 500
    }
  }
);



/**
 * @swagger
 * /cuartos/{id}/estudiantes:
 *   get:
 *     summary: Obtiene todos los estudiantes y trabajadores de un cuarto específico
 *     tags:
 *       - Cuarto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cuarto
 *     responses:
 *       200:
 *         description: Lista de estudiantes y trabajadores del cuarto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estudiantes:
 *                   type: array
 *                   items:
 *                     type: object
 *                 trabajadores:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Cuarto no encontrado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/estudiantes/cuartos/:idCuarto",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { idCuarto } = req.params;
      console.log("Aaaaaaaaaaaaaaaaaaaaaaa")
      const resultado = await getEstudiantesPorCuarto(idCuarto);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /cuartos/asignar-automatico:
 *   post:
 *     summary: Asigna automáticamente un cuarto a un estudiante basándose en género y capacidad disponible
 *     tags:
 *       - Cuarto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               becaId:
 *                 type: integer
 *                 description: ID de la beca donde buscar el cuarto
 *               genero:
 *                 type: string
 *                 enum: [masculino, femenino]
 *                 description: Género del estudiante
 *             required:
 *               - becaId
 *               - genero
 *     responses:
 *       200:
 *         description: Cuarto asignado automáticamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cuarto:
 *                   $ref: '#/components/schemas/Cuartos'
 *                 mensaje:
 *                   type: string
 *                   description: Mensaje de confirmación
 *       400:
 *         description: Género inválido
 *       404:
 *         description: No hay cuartos disponibles
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.post(
  "/cuartos/asignar-automatico",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { becaId, genero } = req.body;

      if (!becaId || !genero) {
        throw new AppError("El ID de la beca y el género son requeridos", 400);
      }

      const resultado = await asignarCuartoAutomatico(becaId, genero);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /cuartos/reubicar-ocupantes:
 *   post:
 *     summary: Reubica todos los ocupantes de un cuarto a otros cuartos disponibles
 *     tags:
 *       - Cuarto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cuartoId:
 *                 type: integer
 *                 description: ID del cuarto a eliminar
 *               reubicaciones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ci:
 *                       type: string
 *                       description: CI del ocupante
 *                     tipo:
 *                       type: string
 *                       enum: [Estudiante, Trabajador]
 *                       description: Tipo de ocupante
 *                     nuevoCuartoId:
 *                       type: integer
 *                       description: ID del nuevo cuarto
 *             required:
 *               - cuartoId
 *               - reubicaciones
 *     responses:
 *       200:
 *         description: Ocupantes reubicados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   description: Mensaje de confirmación
 *                 reubicaciones:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Cuarto no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.post(
  "/cuartos/reubicar-ocupantes",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { cuartoId, reubicaciones } = req.body;

      if (!cuartoId || !reubicaciones || !Array.isArray(reubicaciones)) {
        throw new AppError("El ID del cuarto y las reubicaciones son requeridos", 400);
      }

      const resultado = await reubicarOcupantes(cuartoId, reubicaciones);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
