// utils/email.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or use 'smtp.ethereal.email' for testing
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports.sendBookingConfirmation = async (userEmail, listingTitle, price) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Booking Confirmed for ${listingTitle}`,
    html: `
      <h2>🎉 Booking Confirmed!</h2>
      <p>Your booking for <b>${listingTitle}</b> has been confirmed.</p>
      <p>Amount Paid: ₹${price}</p>
      <p>Thank you for choosing <b>WanderLust</b>!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Confirmation email sent to:", userEmail);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
};
