const User = require("../models/user");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const Order = require("../models/orders");

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

const rzp = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

exports.purchasePremium = (req, res) => {
  const amount = 2500;

  rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
    if (err) {
      console.error("Error creating Razorpay order:", err);
      return res
        .status(500)
        .json({ message: "Error creating Razorpay order", error: err });
    }

    console.log("Order created:", order);

    try {
      await req.user.createOrder({
        paymentId: null,
        orderId: order.id,
        status: "PENDING",
      });
      res.status(201).json({
        razorpayOrderId: order.id,
        razorpayKey: process.env.RAZORPAY_KEY_ID,
        amount: order.amount,
      });
    } catch (err) {
      console.error("Error saving order in database:", err);
      res
        .status(500)
        .json({ message: "Error saving order in database", error: err });
    }
  });
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;
    console.log("Request Body:", req.body);

    if (!payment_id || !order_id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing parameters" });
    }

    const order = await Order.findOne({ where: { orderId: order_id } });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    await order.update({ paymentId: payment_id, status: "SUCCESSFUL" });

    await req.user.update({ isPremium: true });

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
