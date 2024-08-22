const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../util/database");

exports.getExpenses = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 2;
  const offset = (page - 1) * limit;

  try {
    const count = await req.user.countExpenses();
    const result = await req.user.getExpenses({
      limit,
      offset,
      attributes: ["id", "amount", "description", "category"],
      raw: true,
    });

    res.json({
      res: result,
      premium: req.user.isPremium,
      totalItems: count,
    });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ message: "Error fetching expenses" });
  }
};

exports.postExpense = async (req, res) => {
  const t = await sequelize.transaction();
  const { amount, description, category } = req.body;

  try {
    await req.user.createExpense(
      { amount, description, category },
      { transaction: t }
    );

    const currentTotalExpense = parseFloat(req.user.totalExpense) || 0;
    const newTotalExpense = currentTotalExpense + parseFloat(amount);

    await req.user.update(
      { totalExpense: newTotalExpense },
      { transaction: t }
    );

    await t.commit();
    console.log("Expense added");
    res.status(200).json({ message: "Expense added successfully" });
  } catch (err) {
    await t.rollback();
    console.error("Error adding expense:", err);
    res.status(500).json({ message: "Error adding expense" });
  }
};

exports.deleteExpense = async (req, res) => {
  const id = req.params.id;
  const t = await sequelize.transaction();

  try {
    const expense = await Expense.findOne({
      where: { id, userId: req.user.id },
      transaction: t,
    });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expense.destroy({ transaction: t });

    const user = await User.findByPk(req.user.id, { transaction: t });

    const currentTotalExpense = parseFloat(user.totalExpense) || 0;
    const newTotalExpense = currentTotalExpense - parseFloat(expense.amount);

    await user.update({ totalExpense: newTotalExpense }, { transaction: t });

    await t.commit();
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    await t.rollback();
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Error deleting expense" });
  }
};
