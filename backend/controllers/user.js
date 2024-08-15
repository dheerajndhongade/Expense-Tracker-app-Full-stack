const { message } = require("statuses");
let User = require("../models/user");

exports.createUser = (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  User.findOne({ where: { email: email } }).then((existingUser) => {
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    User.create({
      name: name,
      email: email,
      password: password,
    })
      .then(() => {
        console.log("User created");
        res.status(201).json({
          message: "User created successfully",
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.loginUser = (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  User.findOne({ where: { email: email, password: password } })
    .then((user) => {
      if (user) {
        res.status(200).json({ message: "Login successful" });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Error during login" });
    });
};
