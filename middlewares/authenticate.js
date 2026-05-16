const jwt = require("jsonwebtoken");
const AppError = require("../error/AppError");

const authenticate = (roles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new AppError("Necesita iniciar sesión", 403));
    }

    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      
      // Si el usuario es administrador, permitir acceso a todo
      if (decodedToken.role === "administrador") {
        req.userData = {
          id: decodedToken.id,
          nombre_usuario: decodedToken.nombre_usuario,
          role: decodedToken.role
        };
        return next();
      }
      console.log(decodedToken.role)
      // Para otros roles, verificar si tienen permiso
      if (!roles.includes(decodedToken.role) && roles[0] !== "*") {
        return next(new AppError("No tiene permisos para acceder a este recurso", 403));
      }
      
      // Agregar los datos del usuario decodificados a la request
      req.userData = {
        id: decodedToken.id,
        nombre_usuario: decodedToken.nombre_usuario,
        role: decodedToken.role
      };
      
      next();
    } catch (error) {
      return next(new AppError("Token inválido o expirado", 403));
    }
  };
};

module.exports = authenticate;
