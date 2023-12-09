import express from "express";
import User from "../models/User.js";
import Recovery from "../models/Recovery.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'v0e0r0i0f0i0c0a0t0i0on@gmail.com',
    pass: 'pxbc ayay gnhr bwbv ',
  },
});

// Request an OTP for password reset
router.post("/forgotpassword", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save the OTP and expiration time to the Recovery collection
    const recovery = new Recovery({
      user_email: user.email,
      otp: otp,
      otpExpires: new Date(Date.now() + 1 * 3600 * 1000), // 1 hour
    });
    await recovery.save();

    // Send an email to the user with the OTP
    const mailOptions = {
      to: user.email,
      from: 'v0e0r0i0f0i0c0a0t0i0on@gmail.com',
      subject: 'Password Reset Request',
      text: `You are receiving this because you have requested the reset of the password for your account.\n\n`
        + `Your OTP is: ${otp}\n\n`
        + `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Email send error:', err);
        return res.status(500).json({ error: "Email could not be sent" });
      }
      res.status(200).json({ message: "OTP sent successfully" });
    });    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP request failed" });
  }
});

// Reset the user's password with OTP
router.post("/resetpassword", async (req, res) => {
  try {
    console.log("Reset Password Request Body:", req.body);

    const recovery = await Recovery.findOne({
      user_email: req.body.email,
      otp: req.body.otp,
      otpExpires: { $gt: Date.now() },
    });

    console.log("Recovery Document:", recovery);

    if (!recovery) {
      return res.status(400).json({ error: "Invalid OTP or OTP has expired" });
    }

    const user = await User.findOne({ email: req.body.email });
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    user.password = hashedPass;
    await user.save();

    // Delete the recovery record to prevent reusing the OTP
    await Recovery.deleteOne({ _id: recovery._id });

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Password Reset Error:", err);
    res.status(500).json({ error: "Password reset failed" });
  }
});

export default router;


