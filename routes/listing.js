const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");

const listingConstroller=require("../controllers/listings.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
.get(wrapAsync(listingConstroller.index))
.post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingConstroller.createListing));


//New Route
router.get("/new",isLoggedIn,listingConstroller.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingConstroller.showListing))
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingConstroller.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingConstroller.deleteListing));

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingConstroller.renderEditForm));

module.exports=router;
