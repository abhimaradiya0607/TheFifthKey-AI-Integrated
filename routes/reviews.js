const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync.js')
const Review = require('../models/reviews.js');
const { listingSchema, reviewSchema } = require("../schema.js")
const Listing = require('../models/listing.js');


const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg)
    } else {
        next();
    }
}

//Reviews Post Route
router.post('/', validateReview, wrapAsync(async (req, res) => {
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review)
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Review Added Successfully");
    res.redirect(`/listing/${req.params.id}`);
}))

//Review Delete Route
router.delete('/:reviewId', wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    })
    await Review.findByIdAndDelete(reviewId);
    req.flash("error", "Review Deleted Successfully");
    res.redirect(`/listing/${id}`)
}))

module.exports=router;
