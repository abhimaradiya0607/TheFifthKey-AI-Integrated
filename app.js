const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');

const listingrouter = require("./routes/listing.js");
const reviewsrouter = require('./routes/reviews.js');
const userrouter=require("./routes/user.js")

const cookieParser=require('cookie-parser');
const mongoose = require('mongoose');
const session=require('express-session');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, '/public')))
app.use(cookieParser())


app.engine("ejs", ejsMate);

const sessionOption={
    secret:"mysecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+ 7 * 24 * 60* 60* 1000,
        maxAge:7 * 24 * 60* 60* 1000,
        httponly:true,
    }
};

app.use(session(sessionOption));
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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


app.get('/', (req, res) => {
    res.send('Server working')
})

app.use((req,res,next)=>{
    if (req.flash){
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.info=req.flash("info");
    res.locals.currUser=req.user;
    }else{
    res.locals.success = [];
    res.locals.error   = [];
    res.locals.info    = [];
    }
    next();
})

//Listing Route
app.use('/listing', listingrouter);

//Review ROute
app.use('/listing/:id/reviews', reviewsrouter);

app.use("/", userrouter);

app.get('/demouser',async (req,res) => {
    let fakeUser=new User({
        email:"test@gmail.com",
        username:"user-test"
    });

    let registerdUser=await  User.register(fakeUser,"hello-world");
    res.send(registerdUser);

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