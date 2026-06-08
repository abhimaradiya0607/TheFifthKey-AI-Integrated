const express = require('express')
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js')
const { listingSchema, reviewSchema } = require("../schema.js")
const ExpressError = require('../utils/ExpressError.js')
const Listing = require('../models/listing.js');
const {isLoggedIn}=require("../middleware.js")


const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg)
    } else {
        next();
    }
}

//All listing routes
router.get('/', wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings })
}));

//New listing FORM route
router.get('/new', isLoggedIn,(req, res) => {
    res.render('listings/new.ejs')
})

//Show Route
router.get('/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error", "Listing you requested does not exist");
        return res.redirect('/listing');
    }
    res.render('listings/show.ejs', { listing })
}))

//New Listing is added 
router.post('/', validateListing, isLoggedIn,wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","New Listing Created");
    res.redirect('/listing')
}));

//Listing Edit/Update Form
router.get('/:id/edit', isLoggedIn,wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect('/listing');
    }
    res.render('listings/edit.ejs', { listing })
}))

//Edit/Update Route and Save
router.put('/:id', validateListing, isLoggedIn,wrapAsync(async (req, res) => {
    let { id } = req.params;
    let updatedListing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (!updatedListing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect('/listing');

    }
    req.flash("info", "Listing Updated Successfully");
    res.redirect(`/listing/${id}`);
}))


//delets GET request
router.delete('/:id', isLoggedIn,wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("error", "Listing Deleted Successfully");
    console.log('Listing Deleted', deletedListing);
    res.redirect('/listing');
}))

module.exports = router;