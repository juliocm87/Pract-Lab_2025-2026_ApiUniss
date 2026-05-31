const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database");
const Carreras = require("./carreras");

const Horarios = sequelize.define(
  "horarios",
  {
    hora_inicio: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    horario_fin: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    }
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

Horarios.hasOne(Carreras, {
  foreignKey: "becaId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Carreras.belongsTo(Horarios, {
  foreignKey: "becaId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = Horarios;