let Expense = require("../models/expense");

exports.getExpenses = (req, res) => {
  Expense.findAll()
    .then((expenses) => {
      res.json(expenses);
    })

    .catch((err) => console.log(err));
};

exports.postExpense = (req, res) => {
  let amount = req.body.amount;
  let description = req.body.description;
  let category = req.body.category;

  Expense.create({
    amount: amount,
    description: description,
    category: category,
  })
    .then(() => {
      console.log("Expense added");
      res.status(200).json({ message: "Expense added successfully" });
    })
    .catch((err) => console.log(err));
};

exports.deleteExpense = (req, res) => {
  let id = req.params.id;
  Expense.findByPk(id)
    .then((expense) => {
      return expense.destroy();
    })
    .then(() => {
      res.status(200).json({ message: "Expense deleted successfully" });
    })
    .catch((err) => console.log(err));
};
