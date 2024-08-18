let express = require("express");

let expenseController = require("../controllers/expense");
let userAuthenticate = require("../middleware/auth");

let router = express.Router();

//router.use(userAuthenticate);

router.get(
  "/expenses",
  userAuthenticate.authenticate,
  expenseController.getExpenses
);

router.post(
  "/expenses/addexpense",
  userAuthenticate.authenticate,
  expenseController.postExpense
);

router.delete(
  "/expenses/deleteexpense/:id",
  userAuthenticate.authenticate,
  expenseController.deleteExpense
);

module.exports = router;
