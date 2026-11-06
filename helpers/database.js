// importancion de los módulos necesarios
const Sequelize = require("sequelize");
const logger = require("../logger/logger");
const dotenv = require("dotenv").config();

const config = require("../config/config");
const environment = process.env.NODE_ENV || "development";
const configEnv = config[environment];

// Set up the database connection
const sequelize = new Sequelize(
  configEnv.database,
  configEnv.username,
  configEnv.password,
  {
    host: configEnv.host,
    port: configEnv.port,
    dialect: configEnv.dialect,
    logging: false,
  }
);

// función para comprobar que salió bien la conexión con la base de datos
sequelize
  .authenticate()
  .then(() => {
    logger.info("Conexión establecida correctamente.");
  })
  .catch((err) => {
    logger.error("Error al conectarse a la base de datos:");
  });
module.exports = sequelize;
