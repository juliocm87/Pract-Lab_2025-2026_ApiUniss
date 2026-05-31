const router = require("express").Router();
const AppError = require("../error/AppError");

const {
    createAsignaturaCarrera,
    deleteAsignaturaCarrera,
    getAllAsignaturaCarrera,
    updateAsignaturaCarrera
} = require("../controller/asignaturaCarreraController");
const authenticate = require("../middlewares/authenticate");

router.get(
  "/asignatura-carrera",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const asignaturaCarrera = await getAllAsignaturaCarrera();
      res.status(200).json(planes);
    } catch (error) {
      next(error); //Error de servidor 500
    }
  }
);


router.post(
  "/asignatura-carrera/create",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { idAsignatura, 
            idCarrera, 
            horas, 
            anno_academico } = req.body;

      if (!idAsignatura || !idCarrera || !horas || !anno_academico) {
        throw new AppError("Todos los campos son requeridos", 400);
      }
      const asignaturaCarrera = await createAsignaturaCarrera({
            idAsignatura: idAsignatura, 
            idCarrera: idCarrera, 
            anno_academico: anno_academico,
            horas: horas,
            });
      res.status(201).json(plan);
    } catch (error) {
      next(error); //Error de servidor 500
    }
  }
);

router.put(
  "/asignatura-carrera/update/:id",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError("El id es requerido", 400);
      }
      if (!idAsignatura || !idCarrera || !horas || !anno_academico) {
        throw new AppError("Todos los campos son requeridos", 400);
      }
      const asignaturaCarrera = await updateAsignaturaCarrera(id, req.body);
      res.status(200).json({
        mensaje: "AsignaturaCarrera actualizado",
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/asignatura-carrera/delete/:id",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError("El id es requerido", 400);
      }
      const plan = await deleteAsignaturaCarrera(id);
      res.status(200).json({ mensaje: "AsignaturaCarrera eliminado " });
    } catch (error) {
      next(error); //Error de servidor 500
    }
  }
);

module.exports = router;