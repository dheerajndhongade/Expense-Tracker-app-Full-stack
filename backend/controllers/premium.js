const User = require("../models/user");
let sequelize = require("../util/database");
let Expense = require("../models/expense");
let result = [];

exports.leaderBoard = async (req, res, next) => {
  try {
    result = await User.findAll({
      attributes: ["name", "totalExpense"],
      order: [["totalExpense", "DESC"]],
    });
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
  }
};
