const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const { v4: uuidv4 } = require("uuid");

const ForgotPasswordRequests = sequelize.define("ForgotPasswordRequest", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = ForgotPasswordRequests;
