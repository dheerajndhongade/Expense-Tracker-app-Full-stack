let express = require("express");

let router = express.Router();

let premiumController = require("../controllers/premium");

router.get("/showleaderboard", premiumController.leaderBoard);

module.exports = router;
