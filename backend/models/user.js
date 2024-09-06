const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    paymentId: String,
    orderId: String,
    status: String,
  },
  { _id: false }
);

const fileUrlSchema = new mongoose.Schema(
  {
    fileUrl: String,
    downloadDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    totalExpense: {
      type: Number,
      default: 0,
    },
    orders: [orderSchema],
    files: [fileUrlSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
