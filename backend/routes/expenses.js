let express = require("express");

let expenseController = require("../controllers/expense");

let router = express.Router();

router.get("/expenses", expenseController.getExpenses);

router.post("/expenses/addexpense", expenseController.postExpense);

router.delete("/expenses/deleteexpense/:id", expenseController.deleteExpense);

module.exports = router;
