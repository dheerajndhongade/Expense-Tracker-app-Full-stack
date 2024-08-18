const User = require("../models/user");
let sequelize = require("../util/database");
let Expense = require("../models/expense");
let result = [];

exports.leaderBoard = async (req, res, next) => {
  try {
    const leaderBoardOfUsers = await User.findAll({
      attributes: [
        "id",
        "name",
        [sequelize.fn("sum", sequelize.col("expenses.amount")), "total_cost"],
      ],
      include: [
        {
          model: Expense,
          attributes: [],
        },
      ],
      group: ["users.id"],
      order: [["total_cost", "DESC"]],
    });
    const expenses = await Expense.findAll({
      attributes: [
        "id",
        [sequelize.fn("sum", sequelize.col("expenses.amount")), "total_cost"],
      ],
      group: ["id"],
    });
    // result = await User.findAll({
    //   attributes: ["name", "totalExpenses"],
    // });
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
  }
};
