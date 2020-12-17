const { response } = require('express');
var express = require('express');
const { doLogin } = require('../helpers/owner-helpers');
const ownerHelpers = require('../helpers/owner-helpers');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')
var serviceid = "VAb018dbdeb02c7a323cf92a3e9e4dc830";
var accountSid = "AC339f8aff9fd35caeb2ae59401274e823";  // Your Account SID from www.twilio.com/console 
var authToken = "602b2ae53dc5da4bc33e2a7e31febf45"; // Your Auth Token from www.twilio.com/console

const client = require('twilio')(accountSid, authToken)


const verifyLogin = (req, res, next) => {
  if (req.session.user.LogIn) {
    next()
  } else {
    res.redirect('/')
  }
}
/* GET users listing. */
router.get('/', async (req, res, next) => {
  let UpComingMoviesList = await userHelpers.getUpcomingMovie()
  userHelpers.getMovies().then((moviesList) => {
    res.render('user/index', { moviesList, UpComingMoviesList, user: req.session.user })
  })

});


//user login

router.get('/signin', (req, res) => {

  res.render('user/signin')
})

router.post('/getcode', (req, res) => {
  client
    .verify
    .services(serviceid)
    .verifications
    .create({
      to: `+91${req.body.phonenumber}`,
      channel: "sms"
    }).then((data) => {
      res.render('user/verify', { "phone": req.body.phonenumber })
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
      if (data.status == "approved") {
        res.render('user/login-details', { "phone": req.params.phone })
      } else {
        res.render('user/verify', { error: "invalid code", "phone": req.params.phone })
      }

    })
})

router.post('/singup', (req, res) => {
  userHelpers.signup(req.body).then((response) => {
    req.session.user = response
    req.session.user.LogIn = true
    res.redirect('/')
  })
})
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

//user login
router.get('/login', (req, res) => {
  res.render('user/login')
})

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.loggedIn = true;
      client
      .verify
      .services(serviceid)
      .verifications
      .create({
        to: `+91${req.body.phonenumber}`,
        channel: "sms"
      }).then((data) => {
        res.render('user/verify-login', { "phone": req.body.phonenumber })
      })
    } else {
      req.session.ownerLoginError = "Incorrect username or password ";
      res.redirect("/");
    }
  })
 

})

router.post('/verify-login/:phone', (req, res) => {
  console.log(req.params.phone,req.body);
  client
    .verify
    .services(serviceid)
    .verificationChecks
    .create({
      to: `+91${req.params.phone}`,
      code: req.body.code
    }).then((data) => {
      if (data.status == "approved") {
        res.redirect('/')
      } else {
        req.session.owner = false;
        req.session.loggedIn = false
        res.render('user/verify-login', { error: "invalid code", "phone": req.params.phone })
      }

    })
})
router.get('/details', (req, res) => {
  res.render('user/view-details')
})
module.exports = router;
