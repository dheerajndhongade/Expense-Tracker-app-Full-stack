let express = require("express");
let userAuthenticate = require("../middleware/auth");
let purchaseController = require("../controllers/purchase");

let router = express.Router();

router.post(
  "/premiummembership",
  userAuthenticate.authenticate,
  purchaseController.purchasePremium
);
router.post(
  "/updatetransactionstatus",
  userAuthenticate.authenticate,
  purchaseController.updateTransactionStatus
);
module.exports = router;
