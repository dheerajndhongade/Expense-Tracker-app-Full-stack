const User = require("../models/user");
require("dotenv").config();
const jwt = require("jsonwebtoken");
let Razorpay = require("razorpay");
let Order = require("../models/orders");

let razorpayKeyId = process.env.RAZORPAY_KEY_ID;
let razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

let rzp = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

exports.purchasePremium = (req, res) => {
  let amount = 2500;

  rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error creating Razorpay order", error: err });
    }

    req.user
      .createOrder({
        paymentId: null,
        orderId: order.id,
        status: "PENDING",
      })
      .then(() => {
        res.status(201).json({
          razorpayOrderId: order.id,
          razorpayKey: process.env.RAZORPAY_KEY_ID,
          amount: order.amount,
        });
      })
      .catch((err) => {
        res
          .status(500)
          .json({ message: "Error saving order in database", error: err });
      });
  });
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;

    const orderPromise = Order.findOne({ where: { orderId: order_id } });

    const userUpdatePromise = req.user.update({ isPremium: true });

    const [order, userUpdate] = await Promise.all([
      orderPromise,
      userUpdatePromise,
    ]);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    await order.update({ paymentId: payment_id, status: "SUCCESSFUL" });

    const token = jwt.sign(
      { userId: req.user.id, isPremium: true },
      process.env.JWT_SECRET
    );

    return res.status(202).json({
      success: true,
      message: "Transaction Successful",
      token: token,
    });
  } catch (err) {
    console.error("Error in updateTransactionStatus:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
