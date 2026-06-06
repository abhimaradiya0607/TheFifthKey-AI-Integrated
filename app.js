const express = require('express')
const app = express()
const path = require('path')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError.js')
const listing = require("./routes/listing.js")
const reviews = require('./routes/reviews.js')


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

//Listing Route
app.use('/listing', listing);

//Review ROute
app.use('/listing/:id/reviews', reviews);

app.get('/', (req, res) => {
    res.send('Server working')
})

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
})

//Server Side Validation
app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).render('error.ejs', { message });
})

app.listen(PORT, () => {
    console.log(`Server running on localhost:8080`);
})