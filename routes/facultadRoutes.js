const router = require("express").Router();
const AppError = require("../error/AppError");
const authenticate = require("../middlewares/authenticate");

/**
 * @swagger
 * /api/facultades:
 *   get:
 *     summary: Obtiene la lista de facultades desde SIGENU
 *     tags: [Facultades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de facultades obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID único de la facultad
 *                     example: "006"
 *                   nombre_facultad:
 *                     type: string
 *                     description: Nombre de la facultad
 *                     example: "Facultad de Ingeniería"
 *                   decano:
 *                     type: string
 *                     description: Nombre del decano de la facultad
 *                     example: "Dr. Juan Pérez"
 *                   secretario:
 *                     type: string
 *                     description: Nombre del secretario de la facultad
 *                     example: "Dra. María González"
 *                   telefono:
 *                     type: string
 *                     description: Número de teléfono de la facultad
 *                     example: "324755"
 *       401:
 *         description: No autorizado - Credenciales inválidas
 *       502:
 *         description: Error en la respuesta del servidor SIGENU
 *       503:
 *         description: No se pudo conectar con el servidor SIGENU
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/facultades",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      console.log('🏛️ Ruta de facultades llamada');
      
      // Crear las credenciales en base64
      const credentials = Buffer.from('consultor:sigenuquery*40').toString('base64');
      console.log('🔑 Credenciales creadas para SIGENU');

      console.log('🌐 Haciendo petición a SIGENU...');
      const response = await fetch(
        "http://sigenu.uniss.edu.cu/sigenu-rest/dss/getfaculty",
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Accept': 'application/json'
          }
        }
      );

      console.log('📡 Respuesta de SIGENU - Status:', response.status);
      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Error de autenticación con SIGENU');
          throw new AppError("Error de autenticación con SIGENU", 401);
        }
        console.log('❌ Error en respuesta de SIGENU:', response.status);
        throw new AppError(`Error en la respuesta de SIGENU: ${response.status}`, 502);
      }

      const data = await response.json();
      console.log('📊 Datos recibidos de SIGENU:', data.length, 'facultades');

      if (!Array.isArray(data)) {
        console.log('❌ Formato de respuesta inválido de SIGENU');
        throw new AppError("Formato de respuesta inválido de SIGENU", 502);
      }

      // Transformar los datos para que coincidan con el formato que espera el frontend
      const facultades = data.map(facultad => ({
        id: facultad.IdFacultad,
        nombre_facultad: facultad.nombre,
        decano: facultad.nombreDecano,
        secretario: facultad.nombreSecretario,
        telefono: facultad.telf
      }));

      console.log('✅ Enviando respuesta al frontend:', facultades.length, 'facultades');
      res.json(facultades);
    } catch (error) {
      console.error("❌ Error al obtener facultades de SIGENU:", error);
      
      if (error instanceof AppError) {
        next(error);
      } else if (error.name === 'FetchError') {
        console.log('❌ Error de conexión con SIGENU');
        next(new AppError("No se pudo conectar con el servidor SIGENU", 503));
      } else {
        console.log('❌ Error interno del servidor');
        next(new AppError("Error al procesar la solicitud de facultades", 500));
      }
    }
  }
);

/**
 * @swagger
 * /facultades/carreras/{facultadId}:
 *   get:
 *     summary: Obtiene la lista de carreras desde SIGENU filtradas por facultad
 *     tags: [Facultades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facultadId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la facultad para filtrar las carreras
 *         example: "001"
 *     responses:
 *       200:
 *         description: Lista de carreras obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idCarrera:
 *                     type: string
 *                     description: ID único de la carrera
 *                     example: "00101"
 *                   nombre:
 *                     type: string
 *                     description: Nombre de la carrera
 *                     example: "Ingeniería Informática (CD)"
 *                   tipo_curso:
 *                     type: string
 *                     description: Tipo de curso
 *                     example: "01"
 *                   facultad:
 *                     type: string
 *                     description: ID de la facultad a la que pertenece
 *                     example: "001"
 *       400:
 *         description: ID de facultad no proporcionado
 *       401:
 *         description: No autorizado - Credenciales inválidas
 *       502:
 *         description: Error en la respuesta del servidor SIGENU
 *       503:
 *         description: No se pudo conectar con el servidor SIGENU
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/facultades/carreras/:facultadId",
  authenticate(["administrador", "decano", "secretaria_beca", "secretaria_facultad", "jefe_beca"]),
  async (req, res, next) => {
    try {
      const { facultadId } = req.params;
      console.log('🔍 Ruta de carreras llamada con facultadId:', facultadId);

      if (!facultadId) {
        console.log('❌ ID de facultad no proporcionado');
        throw new AppError("ID de facultad es requerido", 400);
      }

      // Crear las credenciales en base64
      const credentials = Buffer.from('consultor:sigenuquery*40').toString('base64');
      console.log('🔑 Credenciales creadas para SIGENU');

      console.log('🌐 Haciendo petición a SIGENU...');
      const response = await fetch(
        "http://sigenu.uniss.edu.cu/sigenu-rest/dss/getcareermodel",
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Accept': 'application/json'
          }
        }
      );

      console.log('📡 Respuesta de SIGENU - Status:', response.status);
      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Error de autenticación con SIGENU');
          throw new AppError("Error de autenticación con SIGENU", 401);
        }
        console.log('❌ Error en respuesta de SIGENU:', response.status);
        throw new AppError(`Error en la respuesta de SIGENU: ${response.status}`, 502);
      }

      const data = await response.json();
      console.log('📊 Datos recibidos de SIGENU:', data.length, 'carreras');

      if (!Array.isArray(data)) {
        console.log('❌ Formato de respuesta inválido de SIGENU');
        throw new AppError("Formato de respuesta inválido de SIGENU", 502);
      }

      // Filtrar las carreras por la facultad seleccionada
      const carreras = data.filter(carrera => carrera.facultad === facultadId);
      console.log('🔍 Carreras filtradas para facultad', facultadId, ':', carreras.length);

      console.log('✅ Enviando respuesta al frontend');
      res.json(carreras);
    } catch (error) {
      console.error("❌ Error al obtener carreras de SIGENU:", error);
      
      if (error instanceof AppError) {
        next(error);
      } else if (error.name === 'FetchError') {
        console.log('❌ Error de conexión con SIGENU');
        next(new AppError("No se pudo conectar con el servidor SIGENU", 503));
      } else {
        console.log('❌ Error interno del servidor');
        next(new AppError("Error al procesar la solicitud de carreras", 500));
      }
    }
  }
);

module.exports = router;
