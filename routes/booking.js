const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const { isLoggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

// 🧾 Show all bookings for logged-in user
router.get("/my-bookings", isLoggedIn, wrapAsync(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing");
  res.render("bookings/myBookings", { bookings });
}));

module.exports = router;
