"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.bulkInsert(
      "trabajadores",
      [
        {
          ci: "12345678", // CI de ejemplo para el administrador
          nombre: "Elena",
          apellido: "Cárdenas",
          telefono: "55512345",
          nivel_escolaridad: "Universitario",
          nombre_usuario: "ecardenas",
          rol: "administrador",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete(
      "trabajadores",
      { nombre_usuario: "ecardenas" },
      {}
    );
  },
};
