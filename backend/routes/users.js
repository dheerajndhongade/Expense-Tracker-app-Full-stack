let express = require("express");

let router = express.Router();
let userController = require("../controllers/user");

router.post("/user/signup", userController.createUser);

module.exports = router;
