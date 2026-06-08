const express = require('express');
const router = express.Router();
const User=require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');


router.get('/signup',(req,res)=>{
    res.render('users/signupform.ejs');
})

router.post('/signup',wrapAsync(async(req,res,next)=>{
    try{
    let {username,email,password}=req.body;

    const newUser= new User({email,username});
    const registeredUser=await User.register(newUser,password);

    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success",`Welcome to TheFifthKey ${req.user.username} `);
        res.redirect('/listing');
    })
    }catch(err){
        if (err.name === "UserExistsError") {
            req.flash("error", "Username already exists. Please choose another username.");
        } else {
            req.flash("error", err.message);
        }
        res.redirect("/listing");
    }
}))

router.get('/login',(req,res)=>{
    res.render('users/loginform.ejs')
})

router.post('/login',
    passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}),async(req,res)=>{
        req.flash("success",`Welcome back ${req.user.username}`);
        res.redirect("/listing");
})

router.get('/logout',(req,res)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","You have successfully Logged Out");
        res.redirect('/listing');
    })
})



module.exports=router;