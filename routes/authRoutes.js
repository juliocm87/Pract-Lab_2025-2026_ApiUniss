const AppError = require("../error/AppError");
const router = require("express").Router();
const {
  login,
  refreshToken,
  getSession
} = require("../controller/authController");
const authenticate = require("../middlewares/authenticate");
// const { getUsuarioById, } = require("../controller/usuarioController");


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autenticar usuario
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 description: Username o email del usuario
 *                 example: elena
 *               contrasena:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: 123
 *             required:
 *               - nombre_usuario
 *               - contrasena
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Token de acceso (duración 15 minutos)
 *                   example: "Bearer eyJhbGciOiJIUzI1NiIs..."
 *                 refreshToken:
 *                   type: string
 *                   description: Token de refresco (duración 7 días)
 *                   example: "Bearer eyJhbGciOiJIUzI1NiIs..."
 *       401:
 *         description: Credenciales inválidas
 *       400:
 *         description: Datos faltantes
 */
router.post("/auth/login", async (req, res, next) => {
  try {
    const { nombre_usuario, contrasena } = req.body;

    if (!nombre_usuario || !contrasena) {
      throw new AppError("nombre_usuario and password are required", 400);
    }

    const { accessToken, refreshToken } = await login(nombre_usuario, contrasena);

    res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/refreshToken:
 *   post:
 *     summary: Refrescar el token de autenticación
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     description: Utiliza el refresh token para obtener un nuevo access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshTokenProvided:
 *                 type: string
 *                 example: "Bearer eyJhbGciOiJIUzI1NiIs..."
 *             required:
 *               - refreshTokenProvided
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Nuevo token de acceso
 *                   example: "Bearer eyJhbGciOiJIUzI1NiIs..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [user, admin]
 *                     person:
 *                       type: object
 *                       properties:
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         gender:
 *                           type: string
 *       401:
 *         description: Token inválido o no proporcionado
 *       404:
 *         description: Usuario no encontrado
 */
router.post("/auth/refreshToken", async (req, res, next) => {
  try {
    const refreshTokenProvided = req.body.refreshToken;

    if (!refreshTokenProvided) {
      throw new AppError("No refresh token provided", 401);
    }

    const { accessToken, user } = await refreshToken(refreshTokenProvided);

    res.status(200).json({
      accessToken: accessToken,
      user,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError(
          "Refresh token expirado, por favor inicie sesión nuevamente",
          401
        )
      );
    }
    next(error);
  }
});

/**
 * @swagger
 * /session:
 *   get:
 *     summary: Obtener datos de la sesión del usuario actual
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     person:
 *                       type: object
 *                       properties:
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         gender:
 *                           type: string
 *       401:
 *         description: No autorizado
 */
router.get(
  "/session",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const sessionData = await getSession(req.userData.id);
      res.status(200).json(sessionData);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión del usuario
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 */
router.post(
  "/auth/logout",
  authenticate(["*"]),
  async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        message: "Sesión cerrada exitosamente",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
