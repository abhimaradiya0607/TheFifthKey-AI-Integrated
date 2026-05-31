const express=require('express')
const app=express()
const Listing=require('./models/listing.js');
const path =require('path')
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate')

app.set('view engine','ejs');
app.set('views',path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,'/public')))

app.engine("ejs",ejsMate);

const mongoose=require('mongoose')

const PORT=8080;

MONGODB_URL="mongodb://localhost:27017/hotels"

main()
.then((res)=>{
    console.log('Connected to DB');
})
.catch((err)=>{
    console.log('Connecttion Errorr',err);
})


async function main() {
    await mongoose.connect(MONGODB_URL)
}


//Index Route
app.get('/listings',async (req,res)=>{
    let allListings=await Listing.find({});
    res.render('listings/index.ejs',{allListings})
})

//Show Route
app.get('/listings/:id',async (req,res) => {
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render('listings/show.ejs',{listing})
})

//New listing FORM route
app.get('/listing/new',(req,res)=>{
    res.render('listings/new.ejs')
})

//New Listing is added 
app.post('/listing',async (req,res) => {
    const newListing=await new Listing(req.body.listing)
    newListing.save();
    console.log(newListing);
    res.redirect('/listings')
})

//Listing Update Form
app.get('/listing/:id/edit',async(req,res)=>{
        let {id}=req.params;
        const listing=await Listing.findById(id);
        res.render('listings/edit.ejs',{listing})
})

//Edit Route and Save
app.put('/listing/:id',async (req,res) => {
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
})


//delets GET request
app.delete('/listings/:id',async (req,res) => {
    let {id}=req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log('Listing Deleted',deletedListing);
    res.redirect('/listings');
})


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

app.get('/',(req,res)=>{
    res.send('Server working')
})

app.listen(PORT,()=>{
    console.log(`Server running on localhost:8080`);
})