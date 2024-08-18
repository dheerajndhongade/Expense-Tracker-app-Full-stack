let Sequelize = require("sequelize");
let sequelize = require("../util/database");

let Order = sequelize.define("orders", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  paymentId: Sequelize.STRING,
  orderId: Sequelize.STRING,
  status: Sequelize.STRING,
});

module.exports = Order;
