const { v4: uuidv4 } = require("uuid");
const Sib = require("sib-api-v3-sdk");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const ForgotPasswordRequest = require("../models/forgotpassword");

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetRequestId = uuidv4();

    const resetRequest = new ForgotPasswordRequest({
      _id: resetRequestId, // Ensure _id is correctly set to accept a string
      userId: user._id,
      isActive: true,
    });

    await resetRequest.save();

    const apiInstance = new Sib.TransactionalEmailsApi();
    const sendSmtpEmail = new Sib.SendSmtpEmail();
    sendSmtpEmail.subject = "Password Reset Request";
    sendSmtpEmail.htmlContent = `<html><body><p>Click <a href="http://localhost:5000/password/resetpassword/${resetRequestId}">here</a> to reset your password.</p></body></html>`;
    sendSmtpEmail.sender = {
      name: "Dheeraj",
      email: "sathyarjun007@gmail.com",
    };
    sendSmtpEmail.to = [{ email }];

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

  // Check if required fields are present
  if (!resetRequestId || !newPassword) {
    return res
      .status(400)
      .json({ message: "Reset request ID and new password are required" });
  }

  try {
    // Log the request to ensure controller is being hit
    console.log(
      "Reset Password controller hit with:",
      resetRequestId,
      newPassword
    );

    // Find the active reset request using Mongoose
    const resetRequest = await ForgotPasswordRequest.findOne({
      _id: resetRequestId,
      isActive: true,
    });

    // Check if reset request exists and is active
    if (!resetRequest) {
      return res
        .status(404)
        .json({ message: "Invalid or expired reset request" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await User.updateOne(
      { _id: resetRequest.userId },
      { $set: { password: hashedPassword } }
    );

    // Deactivate the reset request
    await ForgotPasswordRequest.updateOne(
      { _id: resetRequestId },
      { $set: { isActive: false } }
    );

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};
