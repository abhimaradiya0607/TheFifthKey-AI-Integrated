const express = require('express')
const app = express()
const Listing = require('./models/listing.js');
const path = require('path')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const wrapAsync=require('./utils/wrapAsync.js')
const ExpressError=require('./utils/ExpressError.js')
const {listingSchema}=require("./schema.js")

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, '/public')))

app.engine("ejs", ejsMate);

const mongoose = require('mongoose')

const PORT = 8080;

MONGODB_URL = "mongodb://localhost:27017/hotels"

main()
    .then((res) => {
        console.log('Connected to DB');
    })
    .catch((err) => {
        console.log('Connecttion Errorr', err);
    })
async function main() {
    await mongoose.connect(MONGODB_URL)
}


//Index Route
app.get('/listing', wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings })
}));

//New listing FORM route
app.get('/listing/new',(req, res) => {
    res.render('listings/new.ejs')
})

//Show Route
app.get('/listing/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/show.ejs', { listing })
}))

//New Listing is added 
app.post('/listing', wrapAsync(async (req, res) => {
        let result=listingSchema.validate(req.body);
        console.log(result);
        if(result.error){
            throw new ExpressError(400,result.error)
        }
        const newListing =new Listing(req.body.listing);
        await newListing.save();
        res.redirect('/listing')
}));

//Listing Update Form
app.get('/listing/:id/edit', wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', { listing })
}))

//Edit Route and Save
app.put('/listing/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listing/${id}`);
}))


//delets GET request
app.delete('/listing/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log('Listing Deleted', deletedListing);
    res.redirect('/listing');
}))


// app.get('/testlisting',async (req,res)=>{
//     let sampleListing=new Listing({
//         title:'My Villa',
//         price:1200,
//         location:"Una",
//         description:'Good',
//         country:'India'
//     });

//     await sampleListing.save()
//         console.log('Listing Added');
//         res.send('Successful Testing')
// })
app.get('/', (req, res) => {
    res.send('Server working')
})

app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
})

//Server Side Validation
app.use((err,req,res,next)=>{
    let {statusCode=500,message='Something went wrong'} =err;
    res.status(statusCode).render('error.ejs',{message});
})

app.listen(PORT, () => {
    console.log(`Server running on localhost:8080`);
})