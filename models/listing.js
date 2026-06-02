const mongoose=require('mongoose')


let listingSchema=mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    image:{
        filename:{
            type:String,
            default:"Listing Image",
        },
        url:{
            type:String,
            set: (v) =>v === "" ? "https://unsplash.com/photos/turned-on-hotel-led-signage-TArrnDJuxak" : v,
            default:"https://unsplash.com/photos/turned-on-hotel-led-signage-TArrnDJuxak",
        }
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    location:{
        type:String
    },
    country:{
        type:String
    }
});

const Listing=mongoose.model('Listing',listingSchema);

module.exports=Listing;