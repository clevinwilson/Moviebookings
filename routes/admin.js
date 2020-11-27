const { response } = require('express');
var express = require('express');
var router = express.Router();
var adminHelpers=require('../helpers/admin-helpers')
/* GET home page. */
const verifyLogin =(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/admin')
  }
}
router.get('/', function(req, res, next) {
  res.render('admin/login',{"adminLoginError":req.session.adminLoginError});
  req.session.adminLoginError=false
});

router.get('/dashboard',verifyLogin,(req,res)=>{
  let admin = req.session.admin
  res.render('admin/dashboard',{admin})
})

router.get('/theater-manage',verifyLogin,(req,res)=>{
  let admin = req.session.admin
  res.render('admin/theater-manage',{admin})
})

router.get('/theater-details',verifyLogin,(req,res)=>{
  let admin = req.session.admin
  res.render('admin/theater-details',{admin})
})

router.get('/edit-theater',verifyLogin,(req,res)=>{
  let admin = req.session.admin
  res.render('admin/edit-theater',{admin})
})

router.get('/add-owner',verifyLogin,(req,res)=>{
  let admin = req.session.admin
  res.render('admin/add-owner',{admin})
})

router.get('/user-management',verifyLogin,(req,res)=>{
  let admin = req.session.admin
  res.render('admin/users-management',{admin})
})

router.get('/users-activity',verifyLogin,(req,res)=>{
  let admin = req.session.admin
  res.render('admin/users-activity',{admin})
})

router.post('/login',(req,res)=>{
  adminHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.admin= response.admin
      req.session.loggedIn=true
      console.log(req.session.admin);
      res.redirect('/admin/dashboard')
    }else{
      req.session.adminLoginError="Incorrect username or password "
      res.redirect('/admin')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/admin')
})

router.get('/settings',verifyLogin,(req,res)=>{
  res.render('admin/settings',{"admin":req.session.admin})
})

// admin change passwor router
router.get('/change-password',verifyLogin,(req,res)=>{
  let admin=req.session.admin
  res.render('admin/change-password',{admin,"passwordmessage":req.session.passwordmessage})
  req.session.passwordmessage=false
})

//change password
router.post('/changePassword',verifyLogin,(req,res)=>{
  let admin=req.session.admin._id
  adminHelpers.changePassword(req.body,admin).then((response)=>{
    if(response.status){
      req.session.passwordmessage={
        message:"Password Updated Successfully",
        color:"green"
      }
      res.redirect('/admin/change-password')
    }else{
      req.session.passwordmessage={
        message:response.message,
        color:"red"
      }
      res.redirect('/admin/change-password')
    }
  })
})
module.exports = router;
