const Estudiantes = require("../models/estudiantes");
const Cuarto = require("../models/cuartos");
const Torre = require("../models/torres");
const Piso = require("../models/pisos");
const Beca = require("../models/becas");
const sigenuService = require("../services/sigenu.service");
const AppError = require("../error/AppError");

const getEstudiantes = async (limit = 10, offset = 0, filtroTipo = 'todos') => {
  try {
    let whereClause = {};
    
    // Aplicar filtro por tipo de estudiante
    if (filtroTipo === 'matricula') {
      whereClause.prematricula = false;
    } else if (filtroTipo === 'prematricula') {
      whereClause.prematricula = true;
    }
    // Si filtroTipo es 'todos', no se aplica filtro
    
    const estudiantes = await Estudiantes.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Cuarto,
          include: [
            {
              model: Piso,
              include: [
                {
                  model: Torre,
                  include: [
                    {
                      model: Beca,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    // Obtener datos adicionales de SIGENU para cada estudiante
    const estudiantesCompletos = await Promise.all(
      estudiantes.rows.map(async (estudiante) => {
        try {
          if(!estudiante.prematricula){
            const datosSigenu = await sigenuService.getStudentData(estudiante.ci);
            return {
              ...estudiante.toJSON(),
              datosSigenu
            };

          }else{
            return {
              ...estudiante.toJSON(),
              datosSigenu: null,
              
            };
          }
        } catch (error) {
          console.error(`Error al obtener datos SIGENU para estudiante ${estudiante.ci}:`, error);
          return {
            ...estudiante.toJSON(),
            datosSigenu: null,
            errorSigenu: error.message
          };
        }
      })
    );

    return {
      estudiantes: estudiantesCompletos,
      total: estudiantes.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      totalPages: Math.ceil(estudiantes.count / limit)
    };
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    throw new Error("Error al obtener estudiantes");
  }
};

const createEstudiante = async (ci, cuartoId, nombre, apellido, facultad, carrera, prematricula, anno_academico) => {
  try {
    // Verificar si el estudiante ya existe (incluyendo los eliminados)
    const estudianteExistente = await Estudiantes.findOne({ 
      where: { ci },
      paranoid: false // Incluir registros eliminados
    });

    if (estudianteExistente) {
      if (estudianteExistente.deletedAt) {
        // Si el estudiante existe pero está eliminado, restaurarlo
        await estudianteExistente.restore();
        await estudianteExistente.update(
          { cuartoId, nombre, apellido, facultad, carrera, prematricula, anno_academico }
        );
        return estudianteExistente;
      }
      throw new Error("El estudiante ya existe en el sistema");
    }
    
    // Solo verificar en SIGENU si prematricula es false o no está definido
    if (!prematricula) {
      try {
        await sigenuService.getStudentData(ci);
      } catch (error) {
        if (error.message === "ESTUDIANTE_NO_ENCONTRADO") {
          throw new Error("El estudiante no existe en SIGENU");
        }
        throw error;
      }
    }

    const estudiante = await Estudiantes.create({ ci, cuartoId, nombre, apellido, facultad, carrera, prematricula, anno_academico });
    return estudiante;
  } catch (error) {
    throw error;
  }
};

const verificarDatosEstudiante = async (ci) => {
  try {
    // Verificar si el estudiante ya existe
    const estudianteExistente = await Estudiantes.findOne({ where: { ci } });
    if (estudianteExistente) {
      throw new AppError("El estudiante ya existe en el sistema", 400);
    }

    // Verificar si el estudiante existe en SIGENU y obtener sus datos
    try {
      const datosSigenu = await sigenuService.getStudentData(ci);
      
      // Obtener todas las becas disponibles
      const becas = await Beca.findAll();
      
      // Obtener todas las torres disponibles
      const torres = await Torre.findAll({
        include: [{ model: Beca }]
      });
      
      // Obtener todos los pisos disponibles
      const pisos = await Piso.findAll({
        include: [
          {
            model: Torre,
            include: [{ model: Beca }]
          }
        ]
      });
      
      // Obtener todos los cuartos disponibles
      const cuartos = await Cuarto.findAll({
        include: [
          {
            model: Piso,
            include: [
              {
                model: Torre,
                include: [{ model: Beca }]
              }
            ]
          }
        ]
      });

      return {
        mensaje: "Estudiante encontrado en SIGENU",
        datos: datosSigenu,
        ubicacion: {
          becas,
          torres,
          pisos,
          cuartos
        }
      };
    } catch (error) {
      if (error.message === "ESTUDIANTE_NO_ENCONTRADO") {
        throw new Error("El estudiante no existe en SIGENU");
      }
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

const updateEstudiante = async (ci, campos = {}) => {
  try {
    const estudiante = await Estudiantes.findOne({ where: { ci } });
    if (!estudiante) {
      throw new Error("Estudiante no encontrado");
    }
    // Permitir solo ciertos campos según el tipo de estudiante
    if (estudiante.prematricula) {
      // Prematricula: puede actualizar todos los campos
      const camposPermitidos = [
        "nombre", "apellido", "facultad", "carrera", "anno_academico", "cuartoId", "prematricula"
      ];
      const camposActualizables = {};
      for (const key of camposPermitidos) {
        if (campos[key] !== undefined) {
          camposActualizables[key] = campos[key];
        }
      }
      if (Object.keys(camposActualizables).length > 0) {
        await estudiante.update(camposActualizables);
      }
    } else {
      // Matricula: solo puede actualizar la ubicación (cuartoId)
      if (campos.cuartoId !== undefined) {
        await estudiante.update({ cuartoId: campos.cuartoId });
      }
    }
    // Obtener datos actualizados de SIGENU
    let datosSigenu = null;
    let advertenciaSigenu = null;
    try {
      datosSigenu = await sigenuService.getStudentData(ci);
    } catch (error) {
      advertenciaSigenu = "No se pudo obtener datos de SIGENU: " + error.message;
    }
    return {
      ...estudiante.toJSON(),
      datosSigenu,
      advertenciaSigenu
    };
  } catch (error) {
    throw error;
  }
};

const deleteEstudiante = async (ci) => {
  try {
    const estudiante = await Estudiantes.destroy({ where: { ci } });
    if (!estudiante) {
      throw new Error("Estudiante no encontrado");
    }
    return estudiante;
  } catch (error) {
    throw error;
  }
};

const getEstudianteCompleto = async (ci) => {
  try {
    const estudiante = await Estudiantes.findOne({
      where: { ci },
      include: [
        {
          model: Cuarto,
          include: [
            {
              model: Piso,
              include: [
                {
                  model: Torre,
                  include: [
                    {
                      model: Beca,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!estudiante) {
      throw new Error("Estudiante no encontrado en el sistema local");
    }

    // Si es prematricula, solo devuelve los datos locales
    if (estudiante.prematricula) {
      return estudiante.toJSON();
    }

    // Obtener datos de SIGENU
    try {
      const datosSigenu = await sigenuService.getStudentData(ci);

      // Si el estudiante tiene una facultad, obtener sus datos de SIGENU
      let datosFacultad = null;
      if (estudiante.facultadId) {
        try {
          datosFacultad = await sigenuService.getFacultyData(estudiante.facultadId);
        } catch (error) {
          console.error(`Error al obtener datos de facultad para estudiante ${ci}:`, error);
        }
      }

      return {
        ...estudiante.toJSON(),
        datosSigenu,
        facultad: datosFacultad ? {
          ...estudiante.facultad?.toJSON(),
          datosSigenu: datosFacultad
        } : estudiante.facultad?.toJSON()
      };
    } catch (error) {
      if (error.message === "ESTUDIANTE_NO_ENCONTRADO") {
        return {
          ...estudiante.toJSON(),
          datosSigenu: null,
          errorSigenu: "El estudiante no existe en SIGENU"
        };
      }
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

const migrarPrematriculasAMatricula = async () => {
  try {
    // Buscar todos los estudiantes de prematricula
    const prematriculas = await Estudiantes.findAll({ where: { prematricula: true } });
    let migrados = [];
    let noEncontrados = [];
    for (const estudiante of prematriculas) {
      try {
        // Consultar SIGENU
        const datosSigenu = await sigenuService.getStudentData(estudiante.ci);
        // Si existe en SIGENU, actualizar el estudiante a matricula
        await estudiante.update({
          nombre: null,
          apellido: null,
          facultad: null,
          carrera: null,
          anno_academico: null,
          prematricula: false
        });
        migrados.push(estudiante.ci);
      } catch (error) {
        // Si no existe en SIGENU, no migrar
        noEncontrados.push(estudiante.ci);
      }
    }
    return { migrados, noEncontrados };
  } catch (error) {
    throw error;
  }
};

const buscarEstudiantePorCI = async (ci) => {
  try {
    // Primero buscar en la base de datos local
    const estudiante = await Estudiantes.findOne({ where: { ci } });
    
    if (estudiante) {
      // Si es estudiante de prematrícula, usar datos locales
      if (estudiante.prematricula) {
        return {
          nombre: `${estudiante.nombre || ''} ${estudiante.apellido || ''}`.trim() || 'Estudiante de prematrícula',
          encontrado: true,
          fuente: 'local'
        };
      }
      
      // Si es estudiante regular, buscar en SIGENU
      try {
        const datosSigenu = await sigenuService.getStudentData(ci);
        return {
          nombre: datosSigenu.datosPersonales.nombreCompleto,
          encontrado: true,
          fuente: 'sigenu'
        };
      } catch (error) {
        // Si SIGENU falla, devolver datos locales si existen
        const nombreLocal = `${estudiante.nombre || ''} ${estudiante.apellido || ''}`.trim();
        return {
          nombre: nombreLocal || 'Estudiante encontrado pero el nombre no está disponible',
          encontrado: true,
          fuente: 'local',
          advertencia: 'No se pudo obtener el nombre desde SIGENU. Mostrando datos locales.'
        };
      }
    }
    
    // Si no está en la base de datos local, buscar en SIGENU
    try {
      const datosSigenu = await sigenuService.getStudentData(ci);
      return {
        nombre: datosSigenu.datosPersonales.nombreCompleto,
        encontrado: true,
        fuente: 'sigenu'
      };
    } catch (error) {
      return {
        nombre: null,
        encontrado: false,
        error: 'Este carnet no corresponde a ningún estudiante en el sistema'
      };
    }
  } catch (error) {
    console.error('Error al buscar estudiante por CI:', error);
    return {
      nombre: null,
      encontrado: false,
      error: 'Error al buscar estudiante'
    };
  }
};

module.exports = {
  createEstudiante,
  updateEstudiante,
  getEstudiantes,
  deleteEstudiante,
  getEstudianteCompleto,
  verificarDatosEstudiante,
  migrarPrematriculasAMatricula,
  buscarEstudiantePorCI
};
