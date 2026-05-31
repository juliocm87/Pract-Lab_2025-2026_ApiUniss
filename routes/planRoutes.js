const router = require("express").Router();
const AppError = require("../error/AppError");

const {
    createPlan,
    deletePlan,
    getAllplanes,
    updatePlan,
} = require("../controller/planController");
const authenticate = require("../middlewares/authenticate");

router.get(
  "/plan",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const planes = await getAllplanes();
      res.status(200).json(planes);
    } catch (error) {
      next(error); //Error de servidor 500
    }
  }
);


router.post(
  "/plan/create",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { nombre_plan, descripcion_plan } = req.body;

      if (!nombre_plan || !descripcion_plan) {
        throw new AppError("Todos los campos son requeridos", 400);
      }
      const plan = await createPlan({nombre_plan, descripcion_plan});
      res.status(201).json(plan);
    } catch (error) {
      next(error); //Error de servidor 500
    }
  }
);

router.put(
  "/plan/update/:id",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { nombre_plan, descripcion_plan } = req.body;
      const { id } = req.params;
      if (!id) {
        throw new AppError("El id es requerido", 400);
      }
      if (!nombre_plan || !descripcion_plan) {
        throw new AppError("Todos los campos son requeridos", 400);
      }
      const piso = await updatePlan(id, {
        nombre_plan: nombre_plan, 
        descripcion_plan: descripcion_plan
    });
      res.status(200).json({
        mensaje: "Plan actualizado",
        id: id,
        nombre_plan: nombre_plan, 
        descripcion_plan: descripcion_plan
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/plan/delete/:id",
  authenticate(["administrador","secretaria_beca", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError("El id es requerido", 400);
      }
      const plan = await deletePlan(id);
      res.status(200).json({ mensaje: "Plan eliminado " });
    } catch (error) {
      next(error); //Error de servidor 500
    }
  }
);

module.exports = router;