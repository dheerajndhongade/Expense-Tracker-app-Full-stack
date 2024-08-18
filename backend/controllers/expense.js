let Expense = require("../models/expense");

exports.getExpenses = (req, res) => {
  req.user
    .getExpenses()
    .then((expenses) => {
      res.json({ res: expenses, premium: req.user.isPremium });
    })
    .catch((err) => {
      console.error("Error fetching expenses:", err);
      res.status(500).json({ message: "Error fetching expenses" });
    });
};

exports.postExpense = (req, res) => {
  let amount = req.body.amount;
  let description = req.body.description;
  let category = req.body.category;

  req.user
    .createExpense({
      amount,
      description,
      category,
    })
    .then(() => {
      console.log("Expense added");
      res.status(200).json({ message: "Expense added successfully" });
    })
    .catch((err) => {
      console.error("Error adding expense:", err);
      res.status(500).json({ message: "Error adding expense" });
    });
};

exports.deleteExpense = (req, res) => {
  let id = req.params.id;
  Expense.findOne({ where: { id, userId: req.user.id } })
    .then((expense) => {
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      return expense.destroy();
    })
    .then(() => {
      res.status(200).json({ message: "Expense deleted successfully" });
    })
    .catch((err) => {
      console.error("Error deleting expense:", err);
      res.status(500).json({ message: "Error deleting expense" });
    });
};
