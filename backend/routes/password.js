let express = require("express");
const path = require("path");

let router = express.Router();
let passwordController = require("../controllers/password");
let authenticate = require("../middleware/auth");

router.post("/forgotpassword", passwordController.forgotPassword);

router.post("/resetpassword", passwordController.resetPassword);

router.get("/resetpassword/:id", (req, res) => {
  const resetRequestId = req.params.id;
  console.log(req.params);
  console.log(resetRequestId);
  res.sendFile(path.join(__dirname, "../../frontend/reset-password.html"));
});

module.exports = router;
