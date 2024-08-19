let express = require("express");

let router = express.Router();
let passwordController = require("../controllers/password");
let authenticate = require("../middleware/auth");

router.post("/forgotpassword", passwordController.forgotPassword);

module.exports = router;
