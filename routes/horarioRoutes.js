const router = require("express").Router();

const { getAllHorarios } = require("../controller/horarioController");
const authenticate = require("../middlewares/authenticate");

router.get(
  "/horarios",
  authenticate(["administrador", "decano", "secretaria_facultad", "docente"]),
  async (req, res, next) => {
    try {
      const horarios = await getAllHorarios(req.query);
      res.status(200).json(horarios);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
