const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const paymentController = require("../controllers/payment");
const { isLoggedIn } = require("../middleware");

// Route to create checkout session for a specific listing
router.post(
  "/create-checkout-session/:id",
  isLoggedIn,
  wrapAsync(paymentController.createCheckoutSession)
);


// Routes for success & cancel pages
router.get("/success", (req, res) => {
  res.render("payments/success");
});

router.get("/cancel", (req, res) => {
  res.render("payments/cancel");
});



module.exports = router;
