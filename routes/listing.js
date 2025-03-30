const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema");
const Listing = require("../models/listing");
const {
  isLoggedIn,
  isOwner,
  validateListing,
  validateReview,
} = require("../middleware");
const listingController = require("../controllers/listing");
const multer  = require('multer')
const { storage } = require("../cloudConfig");
const upload = multer({ storage })



router
  .route("/")
  .get(listingController.filterListings)
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  )
  

  //new for rendering
router.get("/new", isLoggedIn, listingController.renderNewForm);
// router.get("/payments", isLoggedIn, listingController.renderPaymentPage);


// router
// .route(":/id")
router.get("/:id",wrapAsync(listingController.showListing))
router.put("/:id",
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing))
router.delete("/:id",isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));


//Index Route
// router.get("/", wrapAsync(listingController.index))

//Show Route
// router.get("/:id", wrapAsync( listingController.showListing))
// Create Route
// router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing))

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);
// router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing))

//Delete Route
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync( listingController.destroyListing))

module.exports = router;
