const Trabajador = require("../models/trabajadores");
const Docente = require("../models/docentes");
const AppError = require("../error/AppError");
const Becas = require("../models/becas");
const Cuartos = require("../models/cuartos");
const Pisos = require("../models/pisos");
const Torres = require("../models/torres");
const { Op } = require("sequelize");
const ldap = require("ldapjs");
const { ValidationError } = require("sequelize");

// Función para crear cliente LDAP
const createLDAPClient = () => {
  try {
    console.log("Creando cliente LDAP...");
    const client = ldap.createClient({
      url: "ldap://10.16.1.2",
      baseDN: "cn=ldap_connection,cn=Users,dc=uniss,dc=edu,dc=cu",
      password: "abcd.1234",
      reconnect: true,
      timeout: 5000,
    });

    client.on("error", (err) => {
      console.error("Error en la conexión LDAP:", err);
    });

    return client;
  } catch (error) {
    console.error("Error al crear cliente LDAP:", error);
    throw new AppError("Error al conectar con el servidor LDAP", 500);
  }
};

// Función para validar usuario en LDAP
const validateUserInLDAP = async (username) => {
  console.log("Validando usuario en LDAP:", username);
  const client = createLDAPClient();

  try {
    return new Promise((resolve, reject) => {
      // Primero nos autenticamos con el usuario de servicio
      const serviceAccount =
        "cn=ldap_connection,cn=Users,dc=uniss,dc=edu,dc=cu";
      const servicePassword = "abcd.1234";

      client.bind(serviceAccount, servicePassword, (err) => {
        if (err) {
          console.error("Error al autenticar cuenta de servicio:", err);
          reject(new AppError("Error de autenticación del servicio LDAP", 500));
          return;
        }

        console.log("Autenticación de servicio exitosa");

        const searchBase = "dc=uniss,dc=edu,dc=cu";
        const searchFilter = `(&(objectClass=user)(sAMAccountName=${username}))`;
        const searchOptions = {
          filter: searchFilter,
          scope: "sub",
          attributes: ["sAMAccountName", "displayName", "mail", "department"],
        };

        console.log("Realizando búsqueda LDAP con filtro:", searchFilter);

        let userFound = false;
        let searchCompleted = false;

        client.search(searchBase, searchOptions, (err, res) => {
          if (err) {
            console.error("Error en búsqueda LDAP:", err);
            if (!searchCompleted) {
              searchCompleted = true;
              reject(
                new AppError(
                  "Error al buscar usuario en LDAP: " + err.message,
                  500
                )
              );
            }
            return;
          }

          res.on("searchEntry", (entry) => {
            console.log("Usuario encontrado en LDAP");
            userFound = true;
          });

          res.on("error", (err) => {
            console.error("Error en la búsqueda LDAP:", err);
            if (!searchCompleted) {
              searchCompleted = true;
              reject(
                new AppError("Error en la búsqueda LDAP: " + err.message, 500)
              );
            }
          });

          res.on("end", () => {
            console.log("Búsqueda LDAP finalizada");
            if (!searchCompleted) {
              searchCompleted = true;
              if (!userFound) {
                console.log("Usuario no encontrado en LDAP");
                reject(new AppError("El usuario no existe en el sistema", 404));
              } else {
                console.log("Usuario validado exitosamente en LDAP");
                resolve(true);
              }
            }
          });
        });
      });
    });
  } catch (error) {
    console.error("Error en validateUserInLDAP:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "Error al validar usuario en LDAP: " + error.message,
      500
    );
  } finally {
    try {
      client.unbind();
      console.log("Conexión LDAP cerrada");
    } catch (error) {
      console.error("Error al cerrar conexión LDAP:", error);
    }
  }
};

const getTrabajador = async () => {
  try {
    const trabajadores = await Trabajador.findAll({
      include: [
        {
          model: Docente,
        },
        {
          model: Becas,
          as: "beca",
          attributes: ["id", "nombre_beca"],
        },
        {
          model: Becas,
          as: "becaJefe",
          attributes: ["id", "nombre_beca"],
        },
        {
          model: Cuartos,
          attributes: ["id", "numero_cuarto"],

          include: [
            {
              model: Pisos,
              include: [{ model: Torres, include: [{ model: Becas }] }],
            },
          ],
        },
        {
          model: Pisos,
          attributes: ["id", "numero_piso"],
          as: "trabajadorSupervisor",

          include: [
            {
              model: Torres,
              attributes: ["id", "nombre_torre"],
            },
          ],
        },
      ],
    });

    // Formatear la respuesta para incluir docente como objeto anidado

    return trabajadores;
  } catch (error) {
    throw new AppError(
      "Error al obtener los trabajadores: " + error.message,
      500
    );
  }
};

const createTrabajador = async (datosCompletos) => {
  const {
    ci,
    nombre,
    apellido,
    telefono,
    nivel_escolaridad,
    nombre_usuario,
    rol,
    becaId,
    cuartoId,
    docente,
    becaJefeId,
    pisoId,
  } = datosCompletos;
  try {
    // Verificar si ya existe un trabajador con ese CI
    const existingTrabajador = await Trabajador.findByPk(ci);
    if (existingTrabajador) {
      throw new AppError("Ya existe un trabajador con ese CI", 400);
    }

    // Verificar si el nombre_usuario ya existe (si se proporciona)
    if (nombre_usuario) {
      const existingUser = await Trabajador.findOne({
        where: { nombre_usuario: nombre_usuario },
      });
      if (existingUser) {
        throw new AppError(
          "Ya existe un trabajador con ese nombre de usuario",
          400
        );
      }

      // Validar que el usuario existe en LDAP
      try {
        // await validateUserInLDAP(nombre_usuario);
        console.log("Usuario validado exitosamente en LDAP");
      } catch (ldapError) {
        console.error("Error en validación LDAP:", ldapError);
        if (ldapError instanceof AppError && ldapError.statusCode === 404) {
          throw new AppError("El usuario no existe en el sistema", 404);
        }
        throw new AppError(
          "Error al validar el usuario en el sistema: " + ldapError.message,
          500
        );
      }
    }

    // Si se especifica un pisoId, verificar que no tenga ya un supervisor
    if (pisoId) {
      const pisoExistente = await Pisos.findByPk(pisoId);
      if (!pisoExistente) {
        throw new AppError("El piso especificado no existe", 404);
      }
    }

    // Crear el trabajador
    const trabajador = await Trabajador.create({
      ci,
      nombre,
      apellido,
      telefono,
      nivel_escolaridad,
      nombre_usuario,
      rol,
      becaId,
      cuartoId,
    });

    // Si se especificó un piso, asignar al trabajador como supervisor
    if (pisoId) {
      await Pisos.update({ trabajadorId: ci }, { where: { id: pisoId } });
    }

    let docenteCreado = null;
    // Si se proporcionaron datos de docente, crear el registro de docente
    if (docente) {
      docenteCreado = await Docente.create({
        trabajadorId: ci,
        facultadId: docente.facultadId,
        cargo: docente.cargo,
      });
    }

    if (becaJefeId) {
      const beca = await Becas.findByPk(becaJefeId);
      if (!beca) {
        throw new AppError("Beca jefe no encontrada", 404);
      }
      await beca.update({
        trabajadorId: ci,
      });
    }

    // Obtener el trabajador con sus relaciones
    const trabajadorConRelaciones = await Trabajador.findByPk(ci, {
      include: [
        {
          model: Docente,
          attributes: ["trabajadorId"],
        },
        {
          model: Pisos,
          attributes: ["id", "numero_piso"],
          as: "trabajadorSupervisor",

          include: [
            {
              model: Torres,
              attributes: ["id", "nombre_torre"],
            },
          ],
        },
      ],
    });

    return trabajadorConRelaciones;
  } catch (error) {
    if (error instanceof ValidationError) {
      // Devuelve todos los mensajes de error de validación
      throw new AppError(
        "Error de validación: " + error.errors.map((e) => e.message).join(", "),
        400
      );
    }
    if (
      error.parent &&
      error.parent.detail &&
      error.parent.detail.includes("ci")
    ) {
      throw new AppError("Trabajador con ese CI", 400);
    }
    if (error instanceof AppError) throw error;
    throw new AppError("Error al crear el trabajador: " + error.message, 500);
  }
};

const updateTrabajador = async (ci, datosActualizacion) => {
  const {
    nombre,
    apellido,
    telefono,
    nivel_escolaridad,
    nombre_usuario,
    rol,
    becaId,
    cuartoId,
    docente,
    becaJefeId,
    pisoId,
  
  } = datosActualizacion;


  try {
    // Verificar si se está cambiando el CI y si el nuevo CI ya existe
    if (datosActualizacion.ci && datosActualizacion.ci !== ci) {
      const existingTrabajador = await Trabajador.findByPk(datosActualizacion.ci);
      if (existingTrabajador) {
        throw new AppError("Ya existe un trabajador con ese CI", 400);
      }
    }
    const ciCambio = datosActualizacion.ci && datosActualizacion.ci !== ci;

    // Verificar si el nombre_usuario ya existe en otro trabajador (si se proporciona)
    // Solo validar si NO se está cambiando el CI, porque si se cambia el CI es el mismo trabajador
    if (nombre_usuario && !ciCambio) {
      const existingUser = await Trabajador.findOne({
        where: {
          nombre_usuario: nombre_usuario,
          ci: { [Op.ne]: ci }, // Excluir el trabajador actual
        },
      });

      if (existingUser) {
        throw new AppError(
          "Ya existe otro trabajador con ese nombre de usuario",
          400
        );
      }

      // Validar que el usuario existe en LDAP
      try {
        // await validateUserInLDAP(nombre_usuario);
        console.log("Usuario validado exitosamente en LDAP");
      } catch (ldapError) {
        console.error("Error en validación LDAP:", ldapError);
        if (ldapError instanceof AppError && ldapError.statusCode === 404) {
          throw new AppError("El usuario no existe en el sistema", 404);
        }
        throw new AppError(
          "Error al validar el usuario en el sistema: " + ldapError.message,
          500
        );
      }
    }

    // Si se especifica un pisoId, verificar que no tenga ya un supervisor
    if (pisoId) {
      const pisoExistente = await Pisos.findByPk(pisoId);
      if (!pisoExistente) {
        throw new AppError("El piso especificado no existe", 404);
      }
      if (pisoExistente.trabajadorId && pisoExistente.trabajadorId !== ci) {
        throw new AppError("El piso ya tiene un supervisor asignado", 400);
      }
    }

    // Actualizar datos del trabajador
    let trabajadorActualizado;
    
   

    // Actualización normal sin cambio de CI
    const trabajador = await Trabajador.update(
      {
        nombre,
        apellido,
        telefono,
        nivel_escolaridad,
        nombre_usuario,
        rol,
        becaId,
        cuartoId,
        ci:  datosActualizacion.ci,
      },
      { where: { ci } }
    );

    if (trabajador[0] === 0) {
      throw new AppError("Trabajador no encontrado", 404);
    }
    
    trabajadorActualizado = await Trabajador.findByPk(ci);

    // Determinar el CI a usar para las operaciones posteriores
    // Si el CI fue cambiado en el formData, usar el nuevo CI
    const ciParaOperaciones = datosActualizacion.ci && datosActualizacion.ci !== ci ? datosActualizacion.ci : ci;

    // Actualizar la supervisión del piso
    // Primero, eliminar la supervisión actual si existe
    await Pisos.update({ trabajadorId: null }, { where: { trabajadorId: ci } });

    // Si se especificó un nuevo piso, asignar al trabajador como supervisor
    if (pisoId) {
      await Pisos.update({ trabajadorId: ciParaOperaciones }, { where: { id: pisoId } });
    }

    // Manejar la actualización de docente
    if (docente) {
      await Docente.findOrCreate({
        where: { trabajadorId: ci },
        defaults: {
          facultadId: docente.facultadId,
          cargo: docente.cargo,
        },
      });
    } else {
      await Docente.destroy({
        where: { trabajadorId: ci },
      });
    }

    if (becaJefeId) {
      const beca = await Becas.findByPk(becaJefeId);
      if (!beca) {
        throw new AppError("Beca jefe no encontrada", 404);
      }
      await beca.update({
        trabajadorId: ciParaOperaciones,
      });
    }

    // Obtener el trabajador actualizado con sus relaciones
    const trabajadorConRelaciones = await Trabajador.findByPk(ciParaOperaciones, {
      include: [
        {
          model: Docente,
          attributes: ["trabajadorId"],
        },
        {
          model: Pisos,
          attributes: ["id", "numero_piso"],
          as: "trabajadorSupervisor",

          include: [
            {
              model: Torres,
              attributes: ["id", "nombre_torre"],
            },
          ],
        },
      ],
    });

    if (!trabajadorConRelaciones) {
      throw new AppError("No se pudo obtener el trabajador actualizado", 500);
    }

    // Formatear la respuesta
    const resultado = trabajadorConRelaciones.get({ plain: true });
    return {
      ...resultado,
      docente: resultado.docente
        ? { trabajadorId: resultado.docente.trabajadorId }
        : null,
      pisoSupervisado: resultado.pisos ? resultado.pisos[0] : null,
    };
  } catch (error) {
  console.log(error)
    if (error instanceof AppError) throw error;
    throw new AppError(
      "Error al actualizar el trabajador: " + error.message,
      500
    );
  }
};

const deleteTrabajador = async (ci) => {
  try {
    const trabajador = await Trabajador.destroy({ where: { ci } });
    if (trabajador === 0) {
      throw new AppError("Trabajador no encontrado", 404);
    }
    return trabajador;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "Error al eliminar el trabajador: " + error.message,
      500
    );
  }
};

const getTrabajadoresUsuarios = async () => {
  try {
    const usuarios = await Trabajador.findAll({
      where: { nombre_usuario: { [Op.ne]: null } },
      include: [
        {
          model: Docente,
        },
        {
          model: Becas,
          as: "beca",
          attributes: ["id", "nombre_beca"],
        },
        {
          model: Becas,
          as: "becaJefe",
          attributes: ["id", "nombre_beca"],
        },
        {
          model: Cuartos,
          attributes: ["id", "numero_cuarto"],
          include: [
            {
              model: Pisos,
              include: [{ model: Torres, include: [{ model: Becas }] }],
            },
          ],
        },
        {
          model: Pisos,
          attributes: ["id", "numero_piso"],
          as: "trabajadorSupervisor",
          include: [
            {
              model: Torres,
              attributes: ["id", "nombre_torre"],
            },
          ],
        },
      ],
    });
    return usuarios;
  } catch (error) {
    throw new AppError(
      "Error al obtener los usuarios del sistema: " + error.message,
      500
    );
  }
};

const updatePerfilCampo = async (ci, camposActualizacion) => {
  const camposPermitidos = [
    "ci",
    "nombre",
    "apellido",
    "telefono",
    "nivel_escolaridad",
  ];
  const camposAActualizar = {};
  for (const campo of camposPermitidos) {
    if (camposActualizacion[campo] !== undefined) {
      camposAActualizar[campo] = camposActualizacion[campo];
    }
  }
  if (Object.keys(camposAActualizar).length !== 1) {
    throw new AppError(
      "Debes enviar solo un campo permitido para actualizar",
      400
    );
  }
  try {
    const trabajador = await Trabajador.findByPk(ci);
    if (!trabajador) {
      throw new AppError("Trabajador no encontrado", 404);
    }
    await Trabajador.update(camposAActualizar, { where: { ci } });
    // Si se cambia el CI, buscar por el nuevo CI
    const nuevoCI = camposAActualizar.ci || ci;
    const trabajadorActualizado = await Trabajador.findByPk(nuevoCI);
    return trabajadorActualizado;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "Error al actualizar el campo de perfil: " + error.message,
      500
    );
  }
};

const getTrabajadorPaginado = async (offset = 0, limit = 10) => {
  try {
    // Convertir offset y limit a números para asegurar que sean válidos
    const offsetNum = parseInt(offset) || 0;
    const limitNum = parseInt(limit) || 10;

    console.log(
      `Buscando trabajadores con offset: ${offsetNum}, limit: ${limitNum}`
    );

    // Primero obtener el conteo total sin includes para evitar problemas de JOIN
    const totalCount = await Trabajador.count();

    // Luego obtener los trabajadores con includes
    const trabajadores = await Trabajador.findAll({
      include: [
        {
          model: Docente,
          required: false,
        },
        {
          model: Becas,
          as: "beca",
          attributes: ["id", "nombre_beca"],
          required: false,
        },
        {
          model: Becas,
          as: "becaJefe",
          attributes: ["id", "nombre_beca"],
          required: false,
        },
        {
          model: Cuartos,
          attributes: ["id", "numero_cuarto"],
          include: [
            {
              model: Pisos,
              include: [{ model: Torres, include: [{ model: Becas }] }],
            },
          ],
        },
        {
          model: Pisos,
          attributes: ["id", "numero_piso"],
          as: "trabajadorSupervisor",
          required: false,
          include: [
            {
              model: Torres,
              attributes: ["id", "nombre_torre"],
              include: [{ model: Becas }],

              required: false,
            },
          ],
        },
      ],
      offset: offsetNum,
      limit: limitNum,
      order: [["ci", "ASC"]], // Ordenar para consistencia
    });

    console.log(`Total de trabajadores en BD: ${totalCount}`);
    console.log(`Trabajadores en esta página: ${trabajadores.length}`);

    return {
      rows: trabajadores,
      count: totalCount,
      pagina: Math.floor(offsetNum / limitNum) + 1,
      totalPaginas: Math.ceil(totalCount / limitNum),
      offset: offsetNum,
      limit: limitNum,
    };
  } catch (error) {
    console.error("Error en getTrabajadorPaginado:", error);
    throw new AppError(
      "Error al obtener los trabajadores paginados: " + error.message,
      500
    );
  }
};

module.exports = {
  createTrabajador,
  updateTrabajador,
  getTrabajador,
  deleteTrabajador,
  getTrabajadoresUsuarios,
  updatePerfilCampo,
  getTrabajadorPaginado,
};
