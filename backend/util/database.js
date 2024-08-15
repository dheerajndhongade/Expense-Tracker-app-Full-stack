let Sequelize = require("sequelize");

let sequelize = new Sequelize("expensetracker", "root", "12@Dheeraj", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
