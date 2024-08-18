let express = require("express");
let cors = require("cors");
let bodyParser = require("body-parser");
let path = require("path");
let port = 5000;

let sequelize = require("./util/database");
let userRoute = require("./routes/users");
let expenseRoute = require("./routes/expenses");
let purchaseRoute = require("./routes/purchase");

let User = require("./models/user");
let Expense = require("./models/expense");
let Order = require("./models/orders");

let app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/user", userRoute);
app.use(expenseRoute);
app.use("/purchase", purchaseRoute);

User.hasMany(Expense, { foreignKey: "userId", onDelete: "CASCADE" });
Expense.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });

sequelize
  .sync()
  //.sync({ force: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`Running at port ${port}`);
    });
  })
  .catch((err) => console.log(err));
