var express = require('express');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')
var serviceid = "VA3543a1df020f68982834326968197063"; // Your Account SID from www.twilio.com/console
var accountSid = "AC81058b7974c9c9cd6ca7ca1c87863d61";   // Your Auth Token from www.twilio.com/console
var authToken = "0fcc223c5401d418bfa08799035c0297";

const client = require('twilio')(accountSid, authToken)

/* GET users listing. */
router.get('/', function (req, res, next) {
  userHelpers.getMovies().then((moviesList)=>{
    res.render('user/index',{moviesList})  
  })

});


//user login

router.get('/signin', (req, res) => {
  
  res.render('user/signin')
})

router.post('/singin', (req, res) => {
  client
    .verify
    .services(serviceid)
    .verifications
    .create({
      to: `+91${req.body.phonenumber}`,
      channel: "sms"
    }).then((data) => {
      res.render('user/verify',{"phone":req.body.phonenumber})
    })
})


router.post('/verify/:phone', (req, res) => {
  console.log('sms');
  client
    .verify
    .services(serviceid)
    .verificationChecks
    .create({
      to: `+91${req.params.phone}`,
      code: req.body.code
    }).then((data) => {
      if(data.status == "approved"){
        // userHelper.doSigin()
      }else{
        console.log('err');
      }

    })
})

router.get('/details',(req,res)=>{
  res.render('user/view-details')
})
module.exports = router;
