// controllers/payment.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const { sendBookingConfirmation } = require("../utils/email"); // ✅ Import email utility

// 1️⃣ Create Checkout Session
module.exports.createCheckoutSession = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // 🚩 Ensure minimum price for Stripe (₹50)
  if (listing.price < 50) {
    req.flash("error", "Minimum booking amount is ₹50 due to payment provider restrictions.");
    return res.redirect(`/listings/${listing._id}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: listing.title,
            description: listing.description,
          },
          unit_amount: listing.price * 100, // convert ₹ to paise
        },
        quantity: 1,
      },
    ],
    success_url: `http://localhost:8080/success?listingId=${listing._id}&amount=${listing.price}`,
    cancel_url: "http://localhost:8080/cancel",
  });

  res.redirect(session.url);
};

// 2️⃣ Success Page + Save Booking + Send Confirmation Email
module.exports.successPage = async (req, res) => {
  try {
    const { listingId, amount } = req.query;

    if (!req.user) {
      req.flash("error", "You must be logged in to complete booking!");
      return res.redirect("/login");
    }

    // ✅ Save booking in DB
    const newBooking = await Booking.create({
      listing: listingId,
      user: req.user._id,
      amount: amount,
      paymentStatus: "paid",
    });

    // ✅ Fetch listing details for email
    const listing = await Listing.findById(listingId);

    // ✅ Send confirmation email
    if (req.user.email) {
      await sendBookingConfirmation(req.user.email, listing.title, amount);
    }

    // ✅ Render success page
    req.flash("success", "Payment successful! Booking confirmed.");
    res.render("payment/success", { listing, amount });

  } catch (err) {
    console.error("❌ Payment Success Error:", err);
    req.flash("error", "Something went wrong while saving your booking.");
    res.redirect("/listings");
  }
};

// 3️⃣ Cancel Page
module.exports.cancelPage = (req, res) => {
  res.render("payment/cancel");
};
