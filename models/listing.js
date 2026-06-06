const mongoose = require('mongoose')
const Review = require("./reviews.js")


let listingSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        filename: {
            type: String,
            default: "Listing Image",
        },
        url: {
            type: String,
            set: (v) => v === "" ? "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800" : v,
            default: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
        }
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    location: {
        type: String
    },
    country: {
        type: String
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reviews",
        }
    ]

});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } })
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;