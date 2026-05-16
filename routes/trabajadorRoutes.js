const router = require("express").Router();

const {
  createTrabajador,
  updateTrabajador,
  getTrabajador,
  deleteTrabajador,
  getTrabajadoresUsuarios,
  updatePerfilCampo,
  getTrabajadorPaginado
} = require("../controller/trabajadorController");
const AppError = require("../error/AppError");
const authenticate = require("../middlewares/authenticate");

/**
 * @swagger
 * /trabajadores:
 *   get:
 *     summary: Obtiene una lista de trabajadores
 *     tags:
 *       - Trabajador
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trabajadores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trabajadores'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/trabajadores",
  authenticate(["administrador", "decano", "secretaria_facultad", "jefe_beca","secretaria_beca"]),
  async (req, res, next) => {
    try {
      const trabajadores = await getTrabajador();
      res.status(200).json(trabajadores);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /trabajadores/create:
 *   post:
 *     summary: Crea un nuevo trabajador
 *     tags:
 *       - Trabajador
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ci:
 *                 type: string
 *                 description: Carnet de identidad del trabajador
 *               nombre:
 *                 type: string
 *                 description: Nombre del trabajador
 *               apellido:
 *                 type: string
 *                 description: Apellido del trabajador
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono
 *               nivel_escolaridad:
 *                 type: string
 *                 description: Nivel de escolaridad
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre de usuario único para autenticación (opcional)
 *               rol:
 *                 type: string
 *                 description: Rol del trabajador en el sistema (opcional)
 *               becaId:
 *                 type: integer
 *                 description: ID de la beca donde pertenece (opcional)
 *               becaJefeId:
 *                 type: integer
 *                 description: ID de la beca donde es jefe (opcional)
 *               cuartoId:
 *                 type: integer
 *                 description: ID del cuarto donde vive (opcional)
 *               pisoId:
 *                 type: integer
 *                 description: ID del piso que supervisa (opcional)
 *               docente:
 *                 type: object
 *                 description: Datos del docente (opcional)
 *                 properties:
 *                   trabajadorId:
 *                     type: string
 *                     description: CI del trabajador que es docente
 *             required:
 *               - ci
 *               - nombre
 *               - apellido
 *               - telefono
 *               - nivel_escolaridad
 *     responses:
 *       201:
 *         description: Trabajador creado exitosamente
 *       400:
 *         description: Datos inválidos o el piso ya tiene un supervisor
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Piso no encontrado
 *       500:
 *         description: Error de servidor
 */
router.post(
  "/trabajadores/create",
  authenticate(["administrador","secretaria_facultad", "jefe_beca","secretaria_beca"]),
  async (req, res, next) => {
    try {
      const { ci, nombre, apellido, telefono, nivel_escolaridad, nombre_usuario, rol, becaId, cuartoId, docente, becaJefeId, pisoId } = req.body;

      if (!ci || !nombre || !apellido || !telefono || !nivel_escolaridad) {
        throw new AppError("Todos los campos son requeridos", 400);
      }
 
      const trabajador = await createTrabajador({
        ci,
        nombre,
        apellido,
        telefono,
        nivel_escolaridad,
        nombre_usuario,
        rol,
        becaId,
        cuartoId,
        docente,
        becaJefeId,
        pisoId
      });

      res.status(201).json(trabajador);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /trabajadores/update/{ci}:
 *   put:
 *     summary: Actualiza un trabajador existente
 *     tags:
 *       - Trabajador
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ci
 *         required: true
 *         schema:
 *           type: string
 *         description: CI del trabajador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del trabajador
 *               apellido:
 *                 type: string
 *                 description: Apellido del trabajador
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono
 *               nivel_escolaridad:
 *                 type: string
 *                 description: Nivel de escolaridad
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre de usuario único para autenticación (opcional)
 *               rol:
 *                 type: string
 *                 description: Rol del trabajador en el sistema (opcional)
 *               becaId:
 *                 type: integer
 *                 description: ID de la beca donde pertenece (opcional)
 *               becaJefeId:
 *                 type: integer
 *                 description: ID de la beca donde es jefe (opcional)
 *               cuartoId:
 *                 type: integer
 *                 description: ID del cuarto donde vive (opcional)
 *               pisoId:
 *                 type: integer
 *                 description: ID del piso que supervisa (opcional)
 *               docente:
 *                 type: object
 *                 description: Datos del docente (opcional)
 *                 properties:
 *                   trabajadorId:
 *                     type: string
 *                     description: CI del trabajador que es docente
 *             required:
 *               - nombre
 *               - apellido
 *               - telefono
 *               - nivel_escolaridad
 *     responses:
 *       200:
 *         description: Trabajador actualizado exitosamente
 *       400:
 *         description: Datos inválidos o el piso ya tiene un supervisor
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Trabajador o piso no encontrado
 *       500:
 *         description: Error de servidor
 */
router.put(
  "/trabajadores/update/:ci",
  authenticate(["administrador","secretaria_facultad", "jefe_beca","secretaria_beca"]),
  async (req, res, next) => {
    try {
      const { ci, nombre, apellido, telefono, nivel_escolaridad, nombre_usuario, rol, becaId, cuartoId, docente, becaJefeId, pisoId } = req.body;
      const { ci: ciParam } = req.params;

      console.log('Datos recibidos en la ruta:', { ci, nombre, apellido, telefono, nivel_escolaridad });

      if (!ciParam) {
        throw new AppError("El CI es requerido", 400);
      }

      // Validar solo los campos que realmente son obligatorios
      const camposFaltantes = [];
      if (!nombre) camposFaltantes.push('nombre');
      if (!apellido) camposFaltantes.push('apellido');
      if (!telefono) camposFaltantes.push('telefono');
      if (!nivel_escolaridad) camposFaltantes.push('nivel_escolaridad');
      
      if (camposFaltantes.length > 0) {
        throw new AppError(`Los campos son requeridos: ${camposFaltantes.join(', ')}`, 400);
      }

      const trabajador = await updateTrabajador(ciParam, {
        ci,
        nombre,
        apellido,
        telefono,
        nivel_escolaridad,
        nombre_usuario,
        rol,
        becaId,
        cuartoId,
        docente,
        becaJefeId,
        pisoId
      });

      res.status(200).json(trabajador);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /trabajadores/delete/{ci}:
 *   delete:
 *     summary: Elimina un trabajador
 *     tags:
 *       - Trabajador
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ci
 *         required: true
 *         schema:
 *           type: string
 *         description: CI del trabajador
 *     responses:
 *       200:
 *         description: Trabajador eliminado exitosamente
 *       400:
 *         description: El CI es requerido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Trabajador no encontrado
 *       500:
 *         description: Error de servidor
 */
router.delete(
  "/trabajadores/delete/:ci",
  authenticate(["administrador","secretaria_facultad", "jefe_beca","secretaria_beca"]),
  async (req, res, next) => {
    try {
      const { ci } = req.params;

      if (!ci) {
        throw new AppError("El CI es requerido", 400);
      }

      const trabajador = await deleteTrabajador(ci);
      if (trabajador == 0) {
        throw new AppError("Trabajador no encontrado", 404);
      }

      res.status(200).json({ mensaje: "Trabajador eliminado" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /trabajadores/usuarios:
 *   get:
 *     summary: Obtiene una lista de trabajadores que son usuarios del sistema
 *     tags:
 *       - Trabajador
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trabajadores usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trabajadores'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/trabajadores/usuarios",
  authenticate(["administrador"]),
  async (req, res, next) => {
    try {
      const usuarios = await getTrabajadoresUsuarios();
      res.status(200).json(usuarios);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /trabajadores/editar-campo/{ci}:
 *   patch:
 *     summary: Edita un campo individual del trabajador
 *     tags:
 *       - Trabajador
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ci
 *         required: true
 *         schema:
 *           type: string
 *         description: CI del trabajador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ci:
 *                 type: string
 *                 description: Nuevo CI (opcional)
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre (opcional)
 *               apellido:
 *                 type: string
 *                 description: Nuevo apellido (opcional)
 *               telefono:
 *                 type: string
 *                 description: Nuevo teléfono (opcional)
 *               nivel_escolaridad:
 *                 type: string
 *                 description: Nuevo nivel de escolaridad (opcional)
 *     responses:
 *       200:
 *         description: Campo actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Trabajador no encontrado
 *       500:
 *         description: Error de servidor
 */
router.patch(
  '/trabajadores/editar-campo/:ci',
  authenticate(["*"]),
  async (req, res, next) => {
    try {
      const { ci } = req.params;
      const camposPermitidos = ['ci', 'nombre', 'apellido', 'telefono', 'nivel_escolaridad'];
      const camposActualizacion = {};
      for (const campo of camposPermitidos) {
        if (req.body[campo] !== undefined) {
          camposActualizacion[campo] = req.body[campo];
        }
      }
      if (Object.keys(camposActualizacion).length !== 1) {
        throw new AppError('Debes enviar solo un campo permitido para actualizar', 400);
      }
      const resultado = await updatePerfilCampo(ci, camposActualizacion);
      res.status(200).json({ success: true, trabajador: resultado });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /trabajadores/{limit}/{offset}:
 *   get:
 *     summary: Obtiene una lista paginada de trabajadores
 *     tags:
 *       - Trabajador
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de trabajadores a obtener
 *       - in: path
 *         name: offset
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de trabajadores a omitir
 *     responses:
 *       200:
 *         description: Lista paginada de trabajadores
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
  "/trabajadores/:limit/:offset",
  authenticate(["administrador", "decano", "secretaria_facultad", "jefe_beca","secretaria_beca"]),
  async (req, res, next) => {
    try {
      const limit = parseInt(req.params.limit) || 10;
      const offset = parseInt(req.params.offset) || 0;
      const trabajadores = await getTrabajadorPaginado(offset, limit);
      res.status(200).json({
        rows: trabajadores.rows,
        count: trabajadores.count
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;