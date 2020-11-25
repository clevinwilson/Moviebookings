const { response } = require('express');
var express = require('express');
var router = express.Router();
var adminHelpers=require('../helpers/admin-helpers')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin/login');
});

router.get('/dashboard',(req,res)=>{
  res.render('admin/dashboard')
})

router.get('/theater-manage',(req,res)=>{
  res.render('admin/theater-manage')
})

router.get('/theater-details',(req,res)=>{
  res.render('admin/theater-details')
})

router.get('/edit-theater',(req,res)=>{
  res.render('admin/edit-theater')
})

router.get('/add-owner',(req,res)=>{
  res.render('admin/add-owner')
})

router.get('/user-management',(req,res)=>{
  res.render('admin/users-management')
})

router.get('/users-activity',(req,res)=>{
  res.render('admin/users-activity')
})

router.post('/login',(req,res)=>{
  adminHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      res.redirect('/admin//dashboard')
    }else{
      res.redirect('/admin')
    }
  })
})

module.exports = router;
