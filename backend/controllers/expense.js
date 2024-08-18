const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../util/database");

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await req.user.getExpenses();
    res.json({ res: expenses, premium: req.user.isPremium });
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

    const sum = req.user.totalExpense + amount;
    await req.user.update({ totalExpense: sum }, { transaction: t });

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
    const sum = user.totalExpense - expense.amount;
    await user.update({ totalExpense: sum }, { transaction: t });

    await t.commit();
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    await t.rollback();
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Error deleting expense" });
  }
};
