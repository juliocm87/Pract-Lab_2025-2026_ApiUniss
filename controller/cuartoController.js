const AppError = require("../error/AppError");
const Cuarto = require("../models/cuartos");
const Torre = require("../models/torres");
const Piso = require("../models/pisos");
const Beca = require("../models/becas");
const Estudiantes = require("../models/estudiantes");
const Trabajador = require("../models/trabajadores");
const { Op } = require("sequelize");
const sigenuService = require("../services/sigenu.service");

const getCuarto = async () => {
  try {
    const cuartos = await Cuarto.findAll({
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
    });
    return cuartos;
  } catch (error) {
    throw error;
  }
};

const getAllCuartos = async () => {
  try {
    const cuartos = await Cuarto.findAll({
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
    });
    return cuartos;
  } catch (error) {
    throw error;
  }
};

const getCuartoPaginated = async (offset = 0, limit = 10) => {
  try {
    const cuartos = await Cuarto.findAndCountAll({
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
      offset,
      limit
    });
    return cuartos;
  } catch (error) {
    throw error;
  }
};

const getCuartosByPiso = async (pisoId, genero = null) => {
  try {
    const whereClause = { pisoId };
    
    // Si se proporciona un género, agregarlo al filtro
    if (genero) {
      whereClause.genero = genero;
    }

    const cuartos = await Cuarto.findAll({
      where: whereClause,
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
    });

    // Filtrar cuartos que tienen espacio disponible
    const cuartosConEspacio = await Promise.all(
      cuartos.map(async (cuarto) => {
        // Contar estudiantes en el cuarto
        const countEstudiantes = await Estudiantes.count({
          where: { cuartoId: cuarto.id }
        });

        // Contar trabajadores en el cuarto
        const countTrabajadores = await Trabajador.count({
          where: { cuartoId: cuarto.id }
        });

        // Calcular ocupación total
        const ocupacionTotal = countEstudiantes + countTrabajadores;
        
        // Solo retornar si hay espacio disponible
        if (ocupacionTotal < cuarto.capacidad_maxima) {
          return {
            ...cuarto.toJSON(),
            ocupacion_actual: ocupacionTotal,
            espacios_disponibles: cuarto.capacidad_maxima - ocupacionTotal
          };
        }
        return null;
      })
    );

    // Filtrar los cuartos que tienen espacio (eliminar nulls)
    return cuartosConEspacio.filter(cuarto => cuarto !== null);
  } catch (error) {
    throw error;
  }
};

const createCuarto = async (numero_cuarto, capacidad_maxima, genero, pisoId) => {
  try {
    // Obtener el piso con su torre y beca para validar la jerarquía
    const piso = await Piso.findByPk(pisoId, {
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
    });

    if (!piso) {
      throw new AppError("El piso especificado no existe", 404);
    }

    // Verificar si ya existe un cuarto con el mismo número en la misma jerarquía
    const cuartoExistente = await Cuarto.findOne({
      where: { numero_cuarto },
      include: [
        {
          model: Piso,
         
        
        },
      ],
    });

    if (cuartoExistente && cuartoExistente.pisoId === pisoId) {
   
        throw new AppError("Ya existe un cuarto con ese número en la misma torre y beca", 400);
      
    }

    const cuarto = await Cuarto.create({
      numero_cuarto,
      capacidad_maxima,
      genero,
      pisoId,
    });
    return cuarto;
  } catch (error) {
    throw error;
  }
};

const updateCuarto = async (id, numero_cuarto, capacidad_maxima, genero, pisoId) => {
  try {
    // Primero obtener el cuarto actual para verificar si el género está cambiando
    const cuartoActual = await Cuarto.findByPk(id);
    if (!cuartoActual) {
      throw new AppError("Cuarto no encontrado", 404);
    }

    // Si el género está cambiando, verificar si hay estudiantes o trabajadores en el cuarto
    if (cuartoActual.genero !== genero) {
      // Contar estudiantes en el cuarto
      const countEstudiantes = await Estudiantes.count({
        where: { cuartoId: id }
      });

      // Contar trabajadores en el cuarto
      const countTrabajadores = await Trabajador.count({
        where: { cuartoId: id }
      });

      // Si hay estudiantes o trabajadores, no permitir cambiar el género
      if (countEstudiantes > 0 || countTrabajadores > 0) {
        const totalOcupantes = countEstudiantes + countTrabajadores;
        throw new AppError(
          `No se puede cambiar el género del cuarto porque está siendo habitado por ${totalOcupantes} persona${totalOcupantes > 1 ? 's' : ''}. El cuarto debe estar vacío para realizar este cambio.`,
          400
        );
      }
    }

    // Obtener el piso con su torre y beca para validar la jerarquía
    const piso = await Piso.findByPk(pisoId, {
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
    });

    if (!piso) {
      throw new AppError("El piso especificado no existe", 404);
    }

    // Verificar si ya existe un cuarto con el mismo número en la misma jerarquía (excluyendo el actual)
    const cuartoExistente = await Cuarto.findOne({
      where: { 
        numero_cuarto,
        id: { [Op.ne]: id } // Excluir el cuarto que se está actualizando
      },
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
    });

    if (cuartoExistente) {
      const torreExistente = cuartoExistente.Piso.Torre;
      const becaExistente = torreExistente.Beca;
      
      // Si el cuarto existe en la misma jerarquía (misma beca, torre y piso)
      if (torreExistente.id === piso.Torre.id && becaExistente.id === piso.Torre.Beca.id) {
        throw new AppError("Ya existe un cuarto con ese número en la misma torre y beca", 400);
      }
    }

    await Cuarto.update(
      { numero_cuarto, capacidad_maxima, genero, pisoId },
      { where: { id } }
    );

    // Retornar el cuarto actualizado con todos sus datos relacionados
    const cuartoActualizado = await Cuarto.findByPk(id, {
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
    });
    return cuartoActualizado;
  } catch (error) {
    throw error;
  }
};

const deleteCuarto = async (id) => {
  try {
    // Verificar si hay estudiantes asociados al cuarto
    const estudiantesAsociados = await Estudiantes.count({
      where: { cuartoId: id },
    });
    
    // Verificar si hay trabajadores asociados al cuarto
    const trabajadoresAsociados = await Trabajador.count({
      where: { cuartoId: id },
    });

    if (estudiantesAsociados > 0) {
      throw new AppError(
        "No se puede eliminar el cuarto porque tiene estudiantes asociados.",
        400
      );
    }

    if (trabajadoresAsociados > 0) {
      throw new AppError(
        "No se puede eliminar el cuarto porque tiene trabajadores asociados.",
        400
      );
    }

    const cuarto = await Cuarto.destroy({ where: { id } });
    return cuarto;
  } catch (error) {
    console.error("Error al eliminar el cuarto:", error);
    throw error;
  }
};

const getCuartosPorPiso = async (pisoId) => {
  try {
    const cuartos = await Cuarto.findAll({
      where: { pisoId: pisoId },
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
    });

    // Filtrar cuartos que tienen espacio disponible
    const cuartosConEspacio = await Promise.all(
      cuartos.map(async (cuarto) => {
        // Contar estudiantes en el cuarto
        const countEstudiantes = await Estudiantes.count({
          where: { cuartoId: cuarto.id }
        });

        // Contar trabajadores en el cuarto
        const countTrabajadores = await Trabajador.count({
          where: { cuartoId: cuarto.id }
        });

        // Calcular ocupación total
        const ocupacionTotal = countEstudiantes + countTrabajadores;
        
        // Solo retornar si hay espacio disponible
        if (ocupacionTotal < cuarto.capacidad_maxima) {
          return {
            ...cuarto.toJSON(),
            ocupacion_actual: ocupacionTotal,
            espacios_disponibles: cuarto.capacidad_maxima - ocupacionTotal
          };
        }
        return null;
      })
    );

    // Filtrar los cuartos que tienen espacio (eliminar nulls)
    return cuartosConEspacio.filter(cuarto => cuarto !== null);
  } catch (error) {
    throw error;
  }
};

const verificarTrabajadoresEnCuarto = async (cuartoId) => {
  try {
    const trabajadoresCount = await Trabajador.count({
      where: { cuartoId: cuartoId }
    });
    return trabajadoresCount > 0;
  } catch (error) {
    throw error;
  }
};

// Obtener todos los estudiantes de un cuarto específico
const getEstudiantesPorCuarto = async (cuartoId) => {
  try {
    // Obtener estudiantes
    const estudiantes = await Estudiantes.findAll({
      where: { cuartoId },
    });
    // Para los de matrícula, obtener datos de SIGENU
    const estudiantesConDatos = await Promise.all(estudiantes.map(async (est) => {
      if (!est.prematricula) {
        try {
          const datosSigenu = await sigenuService.getStudentData(est.ci);
          return {
            ...est.toJSON(),
            datosSigenu
          };
        } catch (e) {
          return {
            ...est.toJSON(),
            datosSigenu: null,
            errorSigenu: e.message
          };
        }
      } else {
        return est.toJSON();
      }
    }));

    // Obtener trabajadores asociados a este cuarto
    const trabajadores = await Trabajador.findAll({
      where: { cuartoId },
    });

    return {
      estudiantes: estudiantesConDatos,
      trabajadores: trabajadores.map(t => t.toJSON())
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Asigna automáticamente un cuarto a un estudiante basándose en:
 * - Género del estudiante
 * - Capacidad disponible en el cuarto
 * - Prioridad al cuarto con más capacidad disponible
 * - Beca específica
 */
const asignarCuartoAutomatico = async (becaId, genero) => {
  try {
    // Validar que el género sea válido
    if (!['masculino', 'femenino'].includes(genero)) {
      throw new AppError("El género debe ser 'masculino' o 'femenino'", 400);
    }

    // Obtener todos los cuartos de la beca especificada con el género correspondiente
    const cuartos = await Cuarto.findAll({
      where: {
        genero: genero, // por ejemplo, 'masculino'
      },
      include: [
        {
          model: Piso,
          required: true, // fuerza INNER JOIN con Piso
          include: [
            {
              model: Torre,
              required: true, // fuerza INNER JOIN con Torre
              where: { becaId: becaId }, // aquí se filtra
              include: [
                {
                  model: Beca,
                  required: true, // fuerza INNER JOIN con Beca (no estrictamente necesario, pero recomendable)
                },
              ],
            },
          ],
        },
      ],
    });
    
    if (cuartos.length === 0) {
      throw new AppError(`No hay cuartos disponibles para ${genero} en la beca especificada`, 404);
    }

    // Calcular la capacidad disponible para cada cuarto
    const cuartosConCapacidad = await Promise.all(
      cuartos.map(async (cuarto) => {
        // Contar estudiantes en el cuarto
        const countEstudiantes = await Estudiantes.count({
          where: { cuartoId: cuarto.id }
        });

        // Contar trabajadores en el cuarto
        const countTrabajadores = await Trabajador.count({
          where: { cuartoId: cuarto.id }
        });

        // Calcular ocupación total
        const ocupacionTotal = countEstudiantes + countTrabajadores;
        const capacidadDisponible = cuarto.capacidad_maxima - ocupacionTotal;

        return {
          ...cuarto.toJSON(),
          ocupacion_actual: ocupacionTotal,
          capacidad_disponible: capacidadDisponible
        };
      })
    );

    // Filtrar solo cuartos con capacidad disponible
    const cuartosDisponibles = cuartosConCapacidad.filter(
      cuarto => cuarto.capacidad_disponible > 0
    );

    if (cuartosDisponibles.length === 0) {
      throw new AppError(`No hay cuartos con capacidad disponible para ${genero} en la beca especificada`, 404);
    }

    // Ordenar por capacidad disponible (mayor a menor) y seleccionar el primero
    cuartosDisponibles.sort((a, b) => b.capacidad_disponible - a.capacidad_disponible);
    
    const cuartoSeleccionado = cuartosDisponibles[0];

    return {
      cuarto: cuartoSeleccionado,
      mensaje: `Cuarto asignado automáticamente: ${cuartoSeleccionado.numero_cuarto} (${cuartoSeleccionado.capacidad_disponible} espacios disponibles)`
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Reubica todos los ocupantes de un cuarto a otros cuartos disponibles
 * @param {number} cuartoId - ID del cuarto a eliminar
 * @param {Array} reubicaciones - Array de objetos con CI, tipo y nuevo cuarto ID
 * @returns {Object} Resultado de la reubicación
 */
const reubicarOcupantes = async (cuartoId, reubicaciones) => {
  try {
    // Verificar que el cuarto existe
    const cuarto = await Cuarto.findByPk(cuartoId);
    if (!cuarto) {
      throw new AppError("Cuarto no encontrado", 404);
    }

    // Verificar que todas las reubicaciones tienen los datos necesarios
    for (const reubicacion of reubicaciones) {
      if (!reubicacion.ci || !reubicacion.tipo || !reubicacion.nuevoCuartoId) {
        throw new AppError("Todas las reubicaciones deben tener CI, tipo y nuevoCuartoId", 400);
      }
    }

    const resultados = [];
    const errores = [];

    // Procesar cada reubicación
    for (const reubicacion of reubicaciones) {
      try {
        // Verificar que el nuevo cuarto existe y tiene espacio
        const nuevoCuarto = await Cuarto.findByPk(reubicacion.nuevoCuartoId, {
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
        });

        if (!nuevoCuarto) {
          throw new AppError(`Cuarto ${reubicacion.nuevoCuartoId} no encontrado`, 404);
        }

        // Contar ocupantes actuales en el nuevo cuarto
        const countEstudiantes = await Estudiantes.count({
          where: { cuartoId: reubicacion.nuevoCuartoId }
        });

        const countTrabajadores = await Trabajador.count({
          where: { cuartoId: reubicacion.nuevoCuartoId }
        });

        const ocupacionTotal = countEstudiantes + countTrabajadores;

        if (ocupacionTotal >= nuevoCuarto.capacidad_maxima) {
          throw new AppError(`Cuarto ${nuevoCuarto.numero_cuarto} está lleno`, 400);
        }

        // Realizar la reubicación según el tipo
        if (reubicacion.tipo === 'Estudiante') {
          const estudiante = await Estudiantes.findByPk(reubicacion.ci);
          if (!estudiante) {
            throw new AppError(`Estudiante con CI ${reubicacion.ci} no encontrado`, 404);
          }

          // Verificar que el estudiante está en el cuarto que se va a eliminar
          if (estudiante.cuartoId !== parseInt(cuartoId)) {
            throw new AppError(`Estudiante ${reubicacion.ci} no está en el cuarto ${cuartoId}`, 400);
          }

          // Actualizar el cuarto del estudiante
          await estudiante.update({ cuartoId: reubicacion.nuevoCuartoId });

          resultados.push({
            ci: reubicacion.ci,
            tipo: 'Estudiante',
            cuartoAnterior: cuarto.numero_cuarto,
            cuartoNuevo: nuevoCuarto.numero_cuarto,
            mensaje: `Estudiante ${reubicacion.ci} reubicado exitosamente`
          });

        } else if (reubicacion.tipo === 'Trabajador') {
          const trabajador = await Trabajador.findByPk(reubicacion.ci);
          if (!trabajador) {
            throw new AppError(`Trabajador con CI ${reubicacion.ci} no encontrado`, 404);
          }

          // Verificar que el trabajador está en el cuarto que se va a eliminar
          if (trabajador.cuartoId !== parseInt(cuartoId)) {
            throw new AppError(`Trabajador ${reubicacion.ci} no está en el cuarto ${cuartoId}`, 400);
          }

          // Actualizar el cuarto del trabajador
          await trabajador.update({ cuartoId: reubicacion.nuevoCuartoId });

          resultados.push({
            ci: reubicacion.ci,
            tipo: 'Trabajador',
            cuartoAnterior: cuarto.numero_cuarto,
            cuartoNuevo: nuevoCuarto.numero_cuarto,
            mensaje: `Trabajador ${reubicacion.ci} reubicado exitosamente`
          });

        } else {
          throw new AppError(`Tipo de ocupante inválido: ${reubicacion.tipo}`, 400);
        }

      } catch (error) {
        errores.push({
          ci: reubicacion.ci,
          tipo: reubicacion.tipo,
          error: error.message
        });
      }
    }

    // Si hay errores, lanzar excepción con todos los errores
    if (errores.length > 0) {
      throw new AppError(`Errores en reubicación: ${JSON.stringify(errores)}`, 400);
    }

    return {
      mensaje: `${resultados.length} ocupantes reubicados exitosamente`,
      reubicaciones: resultados,
      cuartoEliminado: cuarto.numero_cuarto
    };

  } catch (error) {
    throw error;
  }
};



module.exports = {
  createCuarto,
  updateCuarto,
  getCuarto,
  deleteCuarto,
  getCuartosPorPiso,
  verificarTrabajadoresEnCuarto,
  getEstudiantesPorCuarto,
  getAllCuartos,
  getCuartoPaginated,
  getCuartosByPiso,
  asignarCuartoAutomatico,
  reubicarOcupantes,
};
