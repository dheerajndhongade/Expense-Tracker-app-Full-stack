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
  const { orderId, paymentId, status } = req.body;
  const user = req.user;

  try {
    const order = await Order.findOne({ where: { orderId } });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentId = paymentId;
    order.status = status;

    if (status === "SUCCESS") {
      user.isPremium = true;
    }

    await Promise.all([order.save(), user.save()]);

    res.status(200).json({ message: "Transaction status updated" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating transaction status", error });
  }
};
