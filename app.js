const sequelize = require("./helpers/database.js");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

//Importacion de Winston
const errorHandler = require("./middlewares/errorHandler.js");
const requestLogger = require("./middlewares/requestLogger.js");

//Importacion de el cors
require("dotenv").config();

//importacion de los modelos
const {
  AsignaturaCarrera,
  Asignaturas,
  Becas,
  carreras,
  Cuartos,
  Cursos,
  Docentes,
  Estudiantes,
  Horarios,
  Incidencia,
  Pisos,
  Plan,
  Torres,
  Trabajador,
  Turnos} = require("./models/asociaciones.js");

// Importacion de las rutas
const asignaturaCarreraRoutes = require("./routes/asignaturaCarreraRoutes.js");
const asignaturaRoutes = require("./routes/asignaturasRouters.js");
const authRoutes = require("./routes/authRoutes.js");
const becaRoutes = require("./routes/becaRoutes.js");
const carreraRoutes = require("./routes/carreraRoutes.js");
const cuartoRoutes = require("./routes/cuartoRoutes.js");
const cursoRoutes = require("./routes/cursoRoutes.js");
const docenteRoutes = require("./routes/docenteRoutes.js");
const estudianteRoutes = require("./routes/estudianteRoutes.js");
const facultadRoutes = require("./routes/facultadRoutes.js");
const horarioRoutes = require("./routes/horarioRoutes.js");
const incidenciasRoutes = require("./routes/incidenciasRoutes.js");
const pisoRoutes = require("./routes/pisoRoutes.js");
const planRoutes = require("./routes/planRoutes.js");
const torreRoutes = require("./routes/torreRoutes.js");
const trabajadorRoutes = require("./routes/trabajadorRoutes.js");
const turnoRoutes = require("./routes/turnoRoutes.js");


//Swagger definitions
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Beca API",
      description: "API backend for Beca project",
      version: "1.0.0",
      contact: {
        name: "Elena Cardenas Cruz",
        email: "cardenaselena247@gmail.com",
        url: "",
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Definición de corsOptions

// Uso de Cors
const allowsOrigins = [

  "http://localhost:3000",
  "http://localhost:3001",
  "*",
];
app.use(
  cors({
    origin: allowsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

//Middleware de la aplicacion

app.use(requestLogger);
//uso de las rutas
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use("/", asignaturaCarreraRoutes);
app.use("/", asignaturaRoutes);
app.use("/", authRoutes);
app.use("/", becaRoutes);
app.use("/", carreraRoutes);
app.use("/", cuartoRoutes);
app.use("/", cursoRoutes);
app.use("/", docenteRoutes);
app.use("/", estudianteRoutes);
app.use("/", facultadRoutes);
app.use("/", horarioRoutes);
app.use("/", incidenciasRoutes);
app.use("/", pisoRoutes);
app.use("/", planRoutes);
app.use("/", torreRoutes);
app.use("/", trabajadorRoutes);
app.use("/", turnoRoutes);

app.use(errorHandler);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));



app.listen(process.env.PORT, () => {
  console.log(`Servidor iniciado en el puerto ${process.env.PORT}`);
  console.log(`http://localhost:${process.env.PORT}`);
  console.log(
    `Documentacion de swagger: http://localhost:${process.env.PORT}/api-docs`
  );
});

// Sincronizar los modelos para verificar la conexión con la base de datos
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Todos los modelos se sincronizaron correctamente.");
  })
  .catch((err) => {
    console.log("Ha ocurrido un error al sincronizar los modelos: ", err);
  });
