const Expense = require("../models/expense");
const User = require("../models/user");

exports.getExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const expenses = await Expense.find({ userId: req.user._id })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalItems = await Expense.countDocuments({ userId: req.user._id });

    res.json({
      res: expenses,
      premium: req.user.isPremium,
      totalItems,
    });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ message: "Error fetching expenses" });
  }
};
exports.postExpense = async (req, res) => {
  const { amount, description, category } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const numericAmount = parseFloat(amount);
    await Expense.create({
      amount: numericAmount,
      description,
      category,
      userId: user._id,
    });

    user.totalExpense = (user.totalExpense || 0) + numericAmount;
    await user.save();

    res.status(200).json({ message: "Expense added successfully" });
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ message: "Error adding expense" });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  console.log("aaaaaaa", req.params);

  try {
    const expense = await Expense.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const expenseAmount = expense.amount;
    console.log(expenseAmount);
    user.totalExpense -= expense.amount;
    await user.save();

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Error deleting expense" });
  }
};
