const { v4: uuidv4 } = require("uuid");
const Sib = require("sib-api-v3-sdk");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const ForgotPasswordRequest = require("../models/forgotpassword");

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

let jwtSecretKey = process.env.JWT_SECRET;

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

    const resetRequestId = uuidv4();

    await ForgotPasswordRequest.create({
      id: resetRequestId,
      userId: user.id,
      isActive: true,
    });

    const apiInstance = new Sib.TransactionalEmailsApi();
    const sendSmtpEmail = new Sib.SendSmtpEmail();
    sendSmtpEmail.subject = "Password Reset Request";
    sendSmtpEmail.htmlContent = `<html><body><p>Click <a href="http://localhost:5000/password/resetpassword/${resetRequestId}">here</a> to reset your password.</p></body></html>`;
    sendSmtpEmail.sender = {
      name: "Dheeraj",
      email: "sathyarjun007@gmail.com",
    };
    sendSmtpEmail.to = [{ email: email }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Password reset email sent successfully");
    res
      .status(200)
      .json({ message: "Password reset link has been sent to your email." });
  } catch (error) {
    console.error(
      "Error sending password reset email:",
      error.response ? error.response.body : error.message
    );
    res.status(500).json({ message: "Error sending password reset link" });
  }
};
exports.resetPassword = async (req, res) => {
  const { resetRequestId, newPassword } = req.body;

  try {
    let resetRequest = await ForgotPasswordRequest.findOne({
      where: { id: resetRequestId, isActive: true },
    });

    if (!resetRequest) {
      return res
        .status(404)
        .json({ message: "Invalid or expired reset request" });
    }

    let hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update(
      { password: hashedPassword },
      { where: { id: resetRequest.userId } }
    );

    await ForgotPasswordRequest.update(
      { isActive: false },
      { where: { id: resetRequestId } }
    );

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error resetting password" });
  }
};
