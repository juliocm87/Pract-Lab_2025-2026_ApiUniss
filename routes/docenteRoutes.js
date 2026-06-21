const router = require("express").Router();

const {
  getDocenteByCI,
  getAsignaturasByDocenteCI,
  getTurnosByDocenteCI,
  getDocentesByFacultad
} = require("../controller/docenteController");
const AppError = require("../error/AppError");
const authenticate = require("../middlewares/authenticate");

/**
 * @swagger
 * /docentes/{ci}:
 *   get:
 *     summary: Obtiene datos completos de un docente por su CI
 *     tags:
 *       - Docente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ci
 *         required: true
 *         schema:
 *           type: string
 *         description: CI del docente
 *     responses:
 *       200:
 *         description: Datos del docente con sus relaciones
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Docentes'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Docente no encontrado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/docentes/:ci",
  authenticate(["administrador", "decano", "secretaria_facultad", "docente"]),
  async (req, res, next) => {
    try {
      const { ci } = req.params;

      if (!ci) {
        throw new AppError("El CI es requerido", 400);
      }

      const docente = await getDocenteByCI(ci);
      res.status(200).json(docente);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /docente/{ci}/asignaturas:
 *   get:
 *     summary: Obtiene las asignaturas asignadas a un docente
 *     tags:
 *       - Docente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ci
 *         required: true
 *         schema:
 *           type: string
 *         description: CI del docente
 *     responses:
 *       200:
 *         description: Lista de asignaturas del docente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asignatura'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Docente no encontrado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/docente/:ci/asignaturas",
  authenticate(["administrador", "decano", "secretaria_facultad", "docente"]),
  async (req, res, next) => {
    try {
      const { ci } = req.params;

      if (!ci) {
        throw new AppError("El CI es requerido", 400);
      }

      const asignaturas = await getAsignaturasByDocenteCI(ci);
      res.status(200).json(asignaturas);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /docente/{ci}/turnos:
 *   get:
 *     summary: Obtiene los turnos asignados a un docente
 *     tags:
 *       - Docente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ci
 *         required: true
 *         schema:
 *           type: string
 *         description: CI del docente
 *     responses:
 *       200:
 *         description: Lista de turnos asignados al docente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Turno'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Docente no encontrado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/docente/:ci/turnos",
  authenticate(["administrador", "decano", "secretaria_facultad", "docente"]),
  async (req, res, next) => {
    try {
      const { ci } = req.params;

      if (!ci) {
        throw new AppError("El CI es requerido", 400);
      }

      const turnos = await getTurnosByDocenteCI(ci);
      res.status(200).json(turnos);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /docentes/facultad/{facultadId}:
 *   get:
 *     summary: Obtiene docentes filtrados por facultad
 *     tags:
 *       - Docente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facultadId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la facultad
 *     responses:
 *       200:
 *         description: Lista de docentes de la facultad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Docentes'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error de servidor
 */
router.get(
  "/docentes/facultad/:facultadId",
  authenticate(["administrador", "decano", "secretaria_facultad", "docente"]),
  async (req, res, next) => {
    try {
      const { facultadId } = req.params;

      if (!facultadId) {
        throw new AppError("El ID de la facultad es requerido", 400);
      }

      const docentes = await getDocentesByFacultad(facultadId);
      res.status(200).json(docentes);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
