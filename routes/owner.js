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

//owner screen
router.get('/screen',(req,res)=>{
    res.render('owner/screen')
})

router.get('/add-screen',(req,res)=>{
    res.render('owner/add-screen')
})

router.get('/edit-screen',(req,res)=>{
    res.render('owner/edit-screen')
})

// owner movie management
router.get('/movie-management',(req,res)=>{
    res.render('owner/movie-management')
})

router.get('/add-movie',(req,res)=>{
    res.render('owner/add-movie')
})
module.exports = router;