const logger = require("../logger/logger");

const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} from ${req.ip}`); // Registra la información de la solicitud
  next(); // Pasa el control al siguiente middleware
};

module.exports = requestLogger;