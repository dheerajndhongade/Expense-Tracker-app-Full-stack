let Sequelize = require("sequelize");
let sequelize = require("../util/database");

let User = sequelize.define("users", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isPremium: {
    type: Sequelize.BOOLEAN,
  },
  totalExpense: {
    type: Sequelize.FLOAT,
    defaultValue: 0,
  },
});

module.exports = User;
