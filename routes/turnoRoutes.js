const router = require("express").Router();

const {
  getAllTurnos,
  asignarTurno,
  cancelarTurno,
  modificarTurno,
} = require("../controller/turnoController");
const AppError = require("../error/AppError");
const authenticate = require("../middlewares/authenticate");

const allowedRoles = [
  "administrador",
  "decano",
  "secretaria_facultad",
  "docente",
];

router.get("/turnos", authenticate(allowedRoles), async (req, res, next) => {
  try {
    const turnos = await getAllTurnos(req.query);
    res.status(200).json(turnos);
  } catch (error) {
    next(error);
  }
});

const handleCreateTurno = async (req, res, next) => {
  try {
    const {
      dia_semana,
      horario_inicio,
      horario_fin,
      asignatura_id,
      asignaturaId,
      horario_id,
      horarioId,
      carrera_id,
      carreraId,
    } = req.body;

    if (
      !dia_semana ||
      !horario_inicio ||
      !horario_fin ||
      !(asignatura_id || asignaturaId) ||
      !(horario_id || horarioId || carrera_id || carreraId)
    ) {
      throw new AppError(
        "dia_semana, horario_inicio, horario_fin, asignaturaId y horarioId o carreraId son requeridos",
        400,
      );
    }

    const turno = await asignarTurno(req.body);
    res.status(201).json(turno);
  } catch (error) {
    next(error);
  }
};

router.post("/turnos", authenticate(allowedRoles), handleCreateTurno);

router.post("/turnos/asignar", authenticate(allowedRoles), handleCreateTurno);

router.delete(
  "/turnos/:id",
  authenticate(allowedRoles),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError("El ID del turno es requerido", 400);
      }

      const resultado = await cancelarTurno(id);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/turnos/:id",
  authenticate(allowedRoles),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError("El ID del turno es requerido", 400);
      }

      const turno = await modificarTurno(id, req.body);
      res.status(200).json(turno);
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
