const { response } = require("express");
var express = require("express");
var router = express.Router();
var ownerHelper = require('../helpers/owner-helpers')

const verifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
      next();
    } else {
      res.redirect("/owner");
    }
  };

router.get('/',(req,res)=>{
    res.render('owner/login',{"ownerLoginError":req.session.ownerLoginError})
    req.session.ownerLoginError=false
})
router.get('/dashboard',verifyLogin,(req,res)=>{
    owner=req.session.owner
    res.render('owner/dashboard',{owner})
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

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

//owner screen
router.get('/screen',verifyLogin,(req,res)=>{
    res.render('owner/screen')
})
router.get('/add-screen',verifyLogin,(req,res)=>{
    res.render('owner/add-screen',{"addScreenSucc":req.session.addScreenSucc,"addScreenErr":req.session.addScreenErr})
    req.session.addScreenSucc=false
    req.session.addScreenErr=false
})

router.post('/add-screen',verifyLogin,(req,res)=>{
    ownerHelper.addScreen(req.body).then((response)=>{
        if(response){
            req.session.addScreenSucc="Screen added Successfully"
            res.redirect('/owner/add-screen')
        }else{
            req.session.addScreenErr="Something went wrong try again"
            res.redirect('/owner/add-screen')
        }
    })
})


router.get('/edit-screen',(req,res)=>{
    res.render('owner/edit-screen')
})

router.get('/view-schedule',(req,res)=>{
    res.render('owner/view-schedule')
})
//show routers
router.get('/add-show',(req,res)=>{
    res.render('owner/add-show')
})

router.get('/edit-show',(req,res)=>{
    res.render('owner/edit-show')
})

// owner movie management
router.get('/movie-management',(req,res)=>{
    res.render('owner/movie-management')
})

router.get('/add-movie',(req,res)=>{
    res.render('owner/add-movie')
})

router.get('/upcoming-movies',(req,res)=>{
    res.render('owner/upcoming-movies')
})

router.get('/edit-movie',(req,res)=>{
    res.render('owner/edit-movie')
})

//Owner Users acrivity

router.get('/users-activity',(req,res)=>{
    res.render('owner/users-activity')
})
module.exports = router;