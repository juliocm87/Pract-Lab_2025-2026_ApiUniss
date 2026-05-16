const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const ldap = require('ldapjs');
const { comparePassword } = require("../helpers/hashPass");
const AppError = require("../error/AppError");
const Trabajadores = require("../models/trabajadores");

// Función para crear cliente LDAP
const createLDAPClient = () => {
  try {
    console.log('Creando cliente LDAP...');
    const client = ldap.createClient({
      url: 'ldap://10.16.1.2',
      baseDN: 'cn=ldap_connection,cn=Users,dc=uniss,dc=edu,dc=cu',
      password: 'abcd.1234',
      reconnect: true,
      timeout: 5000
    });

    client.on('error', (err) => {
      console.error('Error en la conexión LDAP:', err);
    });

    return client;
  } catch (error) {
    console.error('Error al crear cliente LDAP:', error);
    throw new AppError("Error al conectar con el servidor LDAP", 500);
  }
};

// Función para promisificar el bind de LDAP
const bindAsync = (client, username, password) => {
  return new Promise((resolve, reject) => {
    console.log('Intentando autenticar usuario:', username);
    client.bind(username, password, (err) => {
      if (err) {
        console.error('Error en autenticación LDAP:', err);
        reject(new AppError("Credenciales inválidas", 401));
      } else {
        console.log('Autenticación LDAP exitosa');
        resolve(true);
      }
    });
  });
};

// Función para autenticar con LDAP
const authenticateLDAP = async (username, password) => {
  console.log('Iniciando autenticación LDAP...');
  const client = createLDAPClient();

  try {
    const userPrincipalName = username.includes("@")
      ? username
      : `${username}@uniss.edu.cu`;

    console.log('Intentando autenticar con:', userPrincipalName);
    await bindAsync(client, userPrincipalName, password);
    return true;
  } catch (error) {
    console.error('Error en authenticateLDAP:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Error en la autenticación LDAP: " + error.message, 401);
  } finally {
    try {
      client.unbind();
      console.log('Conexión LDAP cerrada');
    } catch (error) {
      console.error('Error al cerrar conexión LDAP:', error);
    }
  }
};

// Función para obtener datos del usuario desde LDAP
const getLDAPUserData = async (username) => {
  console.log('Buscando datos del usuario:', username);
  const client = createLDAPClient();

  try {
    return new Promise((resolve, reject) => {
      // Primero nos autenticamos con el usuario de servicio
      const serviceAccount = 'cn=ldap_connection,cn=Users,dc=uniss,dc=edu,dc=cu';
      const servicePassword = 'abcd.1234';

      client.bind(serviceAccount, servicePassword, (err) => {
        if (err) {
          console.error('Error al autenticar cuenta de servicio:', err);
          reject(new AppError("Error de autenticación del servicio LDAP", 500));
          return;
        }

        console.log('Autenticación de servicio exitosa');

        const searchBase = 'dc=uniss,dc=edu,dc=cu';
        const searchFilter = `(&(objectClass=user)(sAMAccountName=${username}))`;
        const searchOptions = {
          filter: searchFilter,
          scope: 'sub',
          attributes: ['sAMAccountName', 'displayName', 'mail', 'department', 'memberOf']
        };

        console.log('Realizando búsqueda LDAP con filtro:', searchFilter);
        
        let userData = null;
        let searchCompleted = false;

        client.search(searchBase, searchOptions, (err, res) => {
          if (err) {
            console.error('Error en búsqueda LDAP:', err);
            if (!searchCompleted) {
              searchCompleted = true;
              reject(new AppError("Error al buscar usuario en LDAP: " + err.message, 500));
            }
            return;
          }

          res.on('searchEntry', (entry) => {
            console.log('Usuario encontrado en LDAP');
            userData = entry.object;
          });

          res.on('error', (err) => {
            console.error('Error en la búsqueda LDAP:', err);
            if (!searchCompleted) {
              searchCompleted = true;
              reject(new AppError("Error en la búsqueda LDAP: " + err.message, 500));
            }
          });

          res.on('end', () => {
            console.log('Búsqueda LDAP finalizada');
            if (!searchCompleted) {
              searchCompleted = true;
              if (!userData) {
                console.log('Usuario no encontrado en LDAP');
                reject(new AppError("Usuario no encontrado en LDAP", 404));
              } else {
                console.log('Datos del usuario obtenidos exitosamente');
                resolve(userData);
              }
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('Error en getLDAPUserData:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Error al obtener datos del usuario: " + error.message, 500);
  } finally {
    try {
      client.unbind();
      console.log('Conexión LDAP cerrada');
    } catch (error) {
      console.error('Error al cerrar conexión LDAP:', error);
    }
  }
};

// Función para determinar el rol basado en los grupos LDAP
const determineRole = (memberOf) => {
  console.log('Determinando rol para grupos:', memberOf);
  if (!memberOf) return 'usuario';
  
  const groups = Array.isArray(memberOf) ? memberOf : [memberOf];
  
  if (groups.some(group => group.includes('CN=Administradores'))) {
    return 'administrador';
  } else if (groups.some(group => group.includes('CN=Gestores'))) {
    return 'gestor';
  }
  
  return 'usuario';
};

const login = async (nombre_usuario, contrasena) => {
  console.log('Iniciando proceso de login para:', nombre_usuario);
  try {
    // Primero buscar el trabajador en la base de datos
    const trabajador = await Trabajadores.findOne({
      where: { nombre_usuario: nombre_usuario },
    
    });

   

    if (!trabajador) {
      throw new AppError("Usuario no encontrado en el sistema", 401);
    }

    if (!trabajador.nombre_usuario) {
      throw new AppError("Este trabajador no tiene permisos para iniciar sesión", 401);
    }

    // Autenticar contraseña con LDAP
   //  await authenticateLDAP(nombre_usuario, contrasena);
    
    // Usar el rol del trabajador desde la base de datos
    const role = trabajador.rol || 'usuario';

    // Si la autenticación es exitosa, generar tokens
    const payload = {
      id: trabajador.ci,
      nombre_usuario: trabajador.nombre_usuario,
      role: role,
      trabajadorId: trabajador.ci
    };

    // Generar ambos tokens
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "1d",
    });

    console.log('Login exitoso para:', nombre_usuario, 'con rol:', role);
    return {
      accessToken,
      refreshToken,
      user: {
        id: trabajador.ci,
        nombre_usuario: trabajador.nombre_usuario,
        role: role,
        trabajador: trabajador
      }
    };
  } catch (error) {
    console.error('Error en login:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Error en el proceso de autenticación: " + error.message, 500);
  }
};

const refreshToken = async (refreshTokenProvided) => {
  console.log('Iniciando refresh token');
  try {
    const decoded = jwt.verify(
      refreshTokenProvided,
      process.env.JWT_REFRESH_SECRET
    );

    // Obtener datos del trabajador desde la base de datos
    const trabajador = await Trabajadores.findByPk(decoded.trabajadorId, {
      include: [
        {
          model: require("../models/becas"),
          as: "beca",
          attributes: ["id", "nombre_beca"],
        },
        {
          model: require("../models/cuartos"),
          attributes: ["id", "numero_cuarto"],
          include: [{ 
            model: require("../models/pisos"), 
            include: [{model: require("../models/torres"), include:[{model: require("../models/becas")}]}] 
          }],
        },
        {
          model: require("../models/pisos"),
          attributes: ["id", "numero_piso"],
          as: "trabajadorSupervisor",
          include: [
            {
              model: require("../models/torres"),
              attributes: ["id", "nombre_torre"],
            },
          ],
        },
      ],
    });

    if (!trabajador) {
      throw new AppError("Trabajador no encontrado", 404);
    }

    // Usar el rol del trabajador desde la base de datos
    const role = trabajador.rol || 'usuario';

    // Generar nuevo access token
    const payload = {
      id: trabajador.ci,
      nombre_usuario: trabajador.nombre_usuario,
      role: role,
      trabajadorId: trabajador.ci
    };

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log('Refresh token exitoso para:', trabajador.nombre_usuario);
    return {
      accessToken: newAccessToken,
      user: {
        nombre_usuario: trabajador.nombre_usuario,
        role: role,
        trabajador: trabajador
      }
    };
  } catch (error) {
    console.error('Error en refreshToken:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Token inválido: " + error.message, 401);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Error al refrescar el token: " + error.message, 500);
  }
};

const getSession = async (ci) => {
  console.log('Obteniendo datos de sesión del trabajador');
  try {
    // El middleware de autenticación ya ha verificado el token y agregado los datos a req.user
   

    // Obtener datos completos del trabajador desde la base de datos
    const trabajador = await Trabajadores.findByPk(ci);

    if (!trabajador) {
      throw new AppError("Trabajador no encontrado", 404);
    }

    console.log('Datos de sesión obtenidos exitosamente para:', trabajador.nombre_usuario);
    return {
      user: {
        id: trabajador.ci,
        nombre_usuario: trabajador.nombre_usuario,
        role: trabajador.rol || 'usuario',
        trabajador: trabajador
      }
    };
  } catch (error) {
    console.error('Error en getSession:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Error al obtener datos de sesión: " + error.message, 500);
  }
};

module.exports = {
  login,
  refreshToken,
  getSession
};
