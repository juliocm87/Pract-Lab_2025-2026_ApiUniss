const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");

// Función para determinar el sexo basado en el CI
const determinarSexo = (ci) => {
  if (!ci || ci.length < 2) return null;
  const penultimoDigito = parseInt(ci[ci.length - 2]);
  return penultimoDigito % 2 === 0 ? 'Masculino' : 'Femenino';
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Trabajadores:
 *       type: object
 *       properties:
 *         ci:
 *           type: string
 *           description: El carnet de identidad del trabajador.
 *         nombre:
 *           type: string
 *           description: El nombre del trabajador.
 *         apellido:
 *           type: string
 *           description: El apellido del trabajador.
 *         telefono:
 *           type: string
 *           description: El número de teléfono del trabajador.
 *         nivel_escolaridad:
 *           type: string
 *           description: El nivel de escolaridad del trabajador.
 *         sexo:
 *           type: string
 *           description: El sexo del trabajador (Masculino/Femenino).
 *         nombre_usuario:
 *           type: string
 *           description: Nombre de usuario único para autenticación (puede ser null).
 *         rol:
 *           type: string
 *           description: Rol del trabajador en el sistema (puede ser null).
 *         becaId:
 *           type: integer
 *           description: ID de la beca asociada al trabajador.
 *         cuartoId:
 *           type: integer
 *           description: ID del cuarto asociado al trabajador.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización.
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de eliminación (soft delete).
 *       required:
 *         - ci
 *         - nombre
 *         - apellido
 */

const Trabajadores = sequelize.define(
  "trabajadores",
  {
    ci: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nivel_escolaridad: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sexo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nombre_usuario: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    rol: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    becaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cuartoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  },
  {
    timestamps: true,
    paranoid: false,
    hooks: {
      beforeCreate: (trabajador) => {
        trabajador.sexo = determinarSexo(trabajador.ci);
      },
      beforeUpdate: (trabajador) => {
        if (trabajador.changed('ci')) {
          trabajador.sexo = determinarSexo(trabajador.ci);
        }
      }
    }
  }
);

module.exports = Trabajadores;