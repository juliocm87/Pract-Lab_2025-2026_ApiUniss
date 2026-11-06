const router = require("express").Router();

const {
  getAllCursos,
  getCursosByCarreraId,
  getAsignaturasByCursoId
} = require("../controller/cursoController");
const AppError = require("../error/AppError");
const authenticate = require("../middlewares/authenticate");

/**
 * @swagger
 * /cursos:
 *   get:
 *     summary: Obtiene todos los cursos (años académicos)
 *     tags:
 *       - Curso
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Curso'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/cursos",
  authenticate(["administrador", "decano", "secretaria_facultad", "docente"]),
  async (req, res, next) => {
    try {
      const cursos = await getAllCursos();
      res.status(200).json(cursos);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /cursos/{carreraId}:
 *   get:
 *     summary: Obtiene cursos asociados a una carrera específica
 *     tags:
 *       - Curso
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carreraId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la carrera
 *     responses:
 *       200:
 *         description: Lista de cursos de la carrera
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Curso'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/cursos/:carreraId",
  authenticate(["administrador", "decano", "secretaria_facultad", "docente"]),
  async (req, res, next) => {
    try {
      const { carreraId } = req.params;

      if (!carreraId) {
        throw new AppError("El ID de la carrera es requerido", 400);
      }

      const cursos = await getCursosByCarreraId(carreraId);
      res.status(200).json(cursos);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /asignaturas/{cursoId}:
 *   get:
 *     summary: Obtiene asignaturas de un curso específico
 *     tags:
 *       - Curso
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cursoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Lista de asignaturas del curso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asignatura'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/asignaturas/:cursoId",
  authenticate(["administrador", "decano", "secretaria_facultad", "docente"]),
  async (req, res, next) => {
    try {
      const { cursoId } = req.params;

      if (!cursoId) {
        throw new AppError("El ID del curso es requerido", 400);
      }

      const asignaturas = await getAsignaturasByCursoId(cursoId);
      res.status(200).json(asignaturas);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
