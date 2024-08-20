let express = require("express");
let router = express.Router();

let premiumController = require("../controllers/premium");
let authenticate = require("../middleware/auth");

router.get("/showleaderboard", premiumController.leaderBoard);

router.get(
  "/downloadreport",
  authenticate.authenticate,
  premiumController.downloadReport
);

router.get(
  "/showdownloads",
  authenticate.authenticate,
  premiumController.showFileUrl
);

module.exports = router;
