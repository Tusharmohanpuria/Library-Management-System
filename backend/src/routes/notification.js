import express from 'express';
import BookTransaction from '../models/BookTransaction.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Function to send email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'v0e0r0i0f0i0c0a0t0i0on@gmail.com',
    pass: 'pxbc ayay gnhr bwbv ',
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    to,
    from: 'v0e0r0i0f0i0c0a0t0i0on@gmail.com',
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email send error:', error);
  }
};

// Function to check and send reminder emails
const checkDueDateAndSendReminder = async () => {
  try {
    const transactions = await BookTransaction.find({ transactionStatus: 'Active' });

    transactions.forEach(async (transaction) => {
      const dueDate = new Date(transaction.toDate);
      const currentDate = new Date();

      const millisecondsInDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

      const daysUntilDue = Math.floor((dueDate - currentDate) / millisecondsInDay);

      // Check if due date is within 5 days
      if (daysUntilDue > 0 && daysUntilDue < 5) {
        const user = await User.findById(transaction.borrowerId);
        const emailSubject = 'Book Due Date Reminder';
        const emailText = `Dear ${user.userFullName}, your book "${transaction.bookName}" is due in ${daysUntilDue} days. Please return it on time.`;

        // Send reminder email
        await sendEmail(user.email, emailSubject, emailText);
      }
    });
  } catch (error) {
    console.error('Error checking due dates and sending reminders:', error);
  }
};

// Schedule task to run at midnight everyday
const scheduleTask = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const timeUntilMidnight = midnight - now;

  checkDueDateAndSendReminder();

  setInterval(() => {
    checkDueDateAndSendReminder();
  }, 24 * 60 * 60 * 1000);
};

scheduleTask();

export default router;
