const dotenv = require('dotenv');
const AppError = require("../error/AppError");

dotenv.config();

class SigenuService {
  constructor() {
    this.baseURL = process.env.SIGENU_API_URL;
    this.auth = {
      username: process.env.SIGENU_API_USER,
      password: process.env.SIGENU_API_PASSWORD
    };
  }

  async getStudentData(ci) {
    try {
      const auth = Buffer.from(`${this.auth.username}:${this.auth.password}`).toString('base64');
      
      
      // Obtener datos del estudiante
      const response = await fetch(`${this.baseURL}/student/fileStudent/getStudentAllData/${ci}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new AppError(`Error SIGENU: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Si la respuesta es un array vacío, el estudiante no existe
      if (!Array.isArray(data) || data.length === 0) {
        throw new AppError("ESTUDIANTE_NO_ENCONTRADO",404);
      }
      
      const studentData = data[0];
      
      // Obtener el listado de carreras
      const careerResponse = await fetch(`${this.baseURL}/dss/getcareermodel`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });

      if (!careerResponse.ok) {
        throw new AppError(`Error SIGENU carreras: ${careerResponse.status}`);
      }

      const careers = await careerResponse.json();

      // console.log(careers) 
      
      let careerName = studentData.docentData.career;
      const foundCareer = careers.find(c => {
         
          return c.idCarrera.toString() === studentData.docentData.career.toString() 
          }
      );
      
      if (foundCareer) {
          careerName = foundCareer.nombre;
      }

      // Filtrar y estructurar los datos necesarios
      return {
        datosPersonales: {
          nombreCompleto: `${studentData.personalData.name} ${studentData.personalData.middleName} ${studentData.personalData.lastName}`.trim(),
          sexo: studentData.personalData.sex,
          direccion: studentData.personalData.address,
          municipio: studentData.personalData.town,
          provincia: studentData.personalData.province,
          pais: studentData.personalData.country,
          fechaNacimiento: studentData.personalData.birthDate,
          telefono: studentData.personalData.phone
        },
        datosAcademicos: {
          facultad: studentData.docentData.faculty,
          carrera: careerName,
          yearAcademico: studentData.docentData.year,
          tipoEstudiante: studentData.docentData.studentType
        },
        datosFamiliares: {
          madre: {
            nombre: studentData.motherData.name,
            ocupacion: studentData.motherData.ocupation
          },
          padre: {
            nombre: studentData.fatherData.name,
            ocupacion: studentData.fatherData.ocupation
          }
        }
      };
    } catch (error) {
      console.error('Error al obtener datos del estudiante:', error);
      if (error.message === "ESTUDIANTE_NO_ENCONTRADO") {
        throw error;
      }
      throw new AppError('Error al obtener datos del estudiante desde SIGENU');
    }
  }

  async getFacultyData(facultyId) {
    try {
      const auth = Buffer.from(`${this.auth.username}:${this.auth.password}`).toString('base64');
      
      const response = await fetch(`${this.baseURL}/dss/getfaculty/${facultyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new AppError(`Error SIGENU: ${response.status}`);
      }

      const data = await response.json();
      
      // Si la respuesta es un array vacío, la facultad no existe
      if (!Array.isArray(data) || data.length === 0) {
        throw new AppError("FACULTAD_NO_ENCONTRADA");
      }

      // Retornamos el primer elemento del array que contiene los datos de la facultad
      return data[0];
    } catch (error) {
      console.error('Error al obtener datos de la facultad:', error);
      if (error.message === "FACULTAD_NO_ENCONTRADA") {
        throw error;
      }
      throw new AppError('Error al obtener datos de la facultad desde SIGENU');
    }
  }
}

module.exports = new SigenuService(); 