const express = require('express');
const router = express.Router();
const User=require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');


router.get('/signup',(req,res)=>{
    res.render('users/signupform.ejs');
})

router.post('/signup',wrapAsync(async(req,res)=>{
    try{
    let {username,email,password}=req.body;

    const newUser= await new User({email,username});
    const registeredUser=await User.register(newUser,password);

    console.log(registeredUser);

    req.flash("success","Welcome to TheFifthKey");
    res.redirect('/listing');
    }catch(e){
        req.flash("error",e.message);
        res.redirect('/signup');
    }
    
}))

router.get('/login',(req,res)=>{
    res.render('users/loginform.ejs')
})

router.post('/login',
    passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}),async(req,res)=>{
        req.flash("success",`Welcome ${req.user.username}`);
        res.redirect("/listing");
})

module.exports=router;