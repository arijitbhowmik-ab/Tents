const express = require("express")
const router = express.Router({mergeParams: true})
const wrapAsync = require('../utils/wrapAsync')
const ExpressError = require('../utils/ExpressError')
const Listing = require('../models/listing')
const Review = require('../models/review')
const {isLoggedIn, validateReview, isReviewAuthor} = require('../middleware')
const reviewController = require("../controllers/review")



//Reviews
//POST Route -----------------
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview))

//Delete Review Route -------------------
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview))

module.exports = router