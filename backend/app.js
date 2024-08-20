let express = require("express");
let cors = require("cors");
let bodyParser = require("body-parser");
let path = require("path");
let port = 5000;

let sequelize = require("./util/database");
let userRoute = require("./routes/users");
let expenseRoute = require("./routes/expenses");
let purchaseRoute = require("./routes/purchase");
let premiumRoute = require("./routes/premium");
let passwordRoute = require("./routes/password");

let User = require("./models/user");
let Expense = require("./models/expense");
let Order = require("./models/orders");
let ForgotPasswordRequests = require("./models/forgotpassword");
let FilesUrl = require("./models/fileurl");

let app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/user", userRoute);
app.use("/password", passwordRoute);

app.use(expenseRoute);
app.use("/purchase", purchaseRoute);
app.use("/premium", premiumRoute);

User.hasMany(Expense, { foreignKey: "userId", onDelete: "CASCADE" });
Expense.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });

User.hasMany(ForgotPasswordRequests, { foreignKey: "userId" });
ForgotPasswordRequests.belongsTo(User, { foreignKey: "userId" });

User.hasMany(FilesUrl, { onDelete: "CASCADE" });
FilesUrl.belongsTo(User);

sequelize
  .sync()
  //.sync({ force: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`Running at port ${port}`);
    });
  })
  .catch((err) => console.log(err));
