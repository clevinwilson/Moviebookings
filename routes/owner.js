const { response } = require("express");
var express = require("express");
var router = express.Router();
var ownerHelper = require('../helpers/owner-helpers')


router.get('/',(req,res)=>{
    res.render('owner/login')
})
router.get('/dashboard',(req,res)=>{
    res.render('owner/dashboard')
})
//login 
router.post('/login',(req,res)=>{
    ownerHelper.doLogin(req.body).then((response)=>{
        if (response.status) {
            req.session.admin = response.admin;
            req.session.loggedIn = true;
            console.log(req.session.admin);
            res.redirect("/owner/dashboard");
          } else {
            req.session.adminLoginError = "Incorrect username or password ";
            res.redirect("/admin");
          }
    })
})
module.exports = router;