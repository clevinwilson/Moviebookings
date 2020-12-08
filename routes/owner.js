const { response } = require("express");
var express = require("express");
var router = express.Router();
var ownerHelper = require('../helpers/owner-helpers')


router.get('/',(req,res)=>{
    res.render('owner/login',{"ownerLoginError":req.session.ownerLoginError})
    req.session.ownerLoginError=false
})
router.get('/dashboard',(req,res)=>{
    res.render('owner/dashboard')
})
//login 
router.post('/login',(req,res)=>{
    ownerHelper.doLogin(req.body).then((response)=>{
        if (response.status) {
            req.session.owner = response.owner;
            req.session.loggedIn = true;
            console.log(req.session.owner);
            res.redirect("/owner/dashboard");
          } else {
            req.session.ownerLoginError = "Incorrect username or password ";
            res.redirect("/owner");
          }
    })
})
module.exports = router;