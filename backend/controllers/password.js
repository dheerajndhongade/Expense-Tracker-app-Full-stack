const jwt = require("jsonwebtoken");
require("dotenv").config();
const Sib = require("sib-api-v3-sdk");
const User = require("../models/user");

let client = Sib.ApiClient.instance;
let apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;
const jwtSecretKey = process.env.JWT_SECRET;

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign({ userId: user.id }, jwtSecretKey);

    let apiInstance = new Sib.TransactionalEmailsApi();
    let sendSmtpEmail = new Sib.SendSmtpEmail();
    sendSmtpEmail.subject = "Password Reset Request";
    sendSmtpEmail.htmlContent = `<html><body><p>Click <a href="http://yourdomain.com/reset-password?token=${resetToken}">here</a> to reset your password.</p></body></html>`;
    sendSmtpEmail.sender = {
      name: "Dheeraj",
      email: "dheerajndhongade@gmail.com",
    };
    sendSmtpEmail.to = [{ email: email }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Password reset email sent successfully");
    res
      .status(200)
      .json({ message: "Password reset link has been sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending password reset link" });
  }
};
