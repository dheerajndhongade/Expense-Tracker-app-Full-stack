let express = require("express");
let cors = require("cors");
let bodyParser = require("body-parser");
let path = require("path");
let port = 5000;

let sequelize = require("./util/database");
let userRoute = require("./routes/users");
let expenseRoute = require("./routes/expenses");
let User = require("./models/user");
let Expense = require("./models/expense");

let app = express();
app.use(cors());
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, "../frontend")));
// app.get("/user/signup", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend", "signup.html"));
// });

// app.get("/user/login", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend", "login.html"));
// });

app.use("/user", userRoute);
app.use(expenseRoute);

User.hasMany(Expense);
Expense.belongsTo(User);

sequelize
  .sync()
  //.sync({ force: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`Running at port ${port}`);
    });
  })
  .catch((err) => console.log(err));
