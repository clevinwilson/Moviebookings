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
  res.render('admin/login');
});

router.get('/dashboard',verifyLogin,(req,res)=>{
  let admin = req.session.admin
  res.render('admin/dashboard',{admin})
})

router.get('/theater-manage',verifyLogin,(req,res)=>{
  res.render('admin/theater-manage')
})

router.get('/theater-details',verifyLogin,(req,res)=>{
  res.render('admin/theater-details')
})

router.get('/edit-theater',verifyLogin,(req,res)=>{
  res.render('admin/edit-theater')
})

router.get('/add-owner',verifyLogin,(req,res)=>{
  res.render('admin/add-owner')
})

router.get('/user-management',verifyLogin,(req,res)=>{
  res.render('admin/users-management')
})

router.get('/users-activity',verifyLogin,(req,res)=>{
  res.render('admin/users-activity')
})

router.post('/login',(req,res)=>{
  adminHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.admin= response.admin
      req.session.loggedIn=true
      console.log(req.session.admin);
      res.redirect('/admin/dashboard')
    }else{
      res.redirect('/admin')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.loggedIn=false
  res.redirect('/admin')

})

module.exports = router;
