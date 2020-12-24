const { response } = require('express');
var express = require('express');
const { doLogin } = require('../helpers/owner-helpers');
const ownerHelpers = require('../helpers/owner-helpers');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')
var serviceid = "VA3543a1df020f68982834326968197063";
var accountSid = "AC81058b7974c9c9cd6ca7ca1c87863d61";  // Your Account SID from www.twilio.com/console 
var authToken = "3f2157c14c51069b6fd56d8d3872eb49"; // Your Auth Token from www.twilio.com/console

const client = require('twilio')(accountSid, authToken)


const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
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

  res.render('user/signin', { "isUser": req.session.isUser })
  req.session.isUser = false
})

router.post('/getcode', (req, res) => {
  userHelpers.userAvailability(req.body.phonenumber).then((response) => {
    if (response.status) {
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
    } else {
      req.session.isUser = "Phone Number alredy exist";
      res.redirect('/signin')
    }
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
    req.session.loggedIn = true
    res.redirect('/')
  })
})

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

//user login
router.get('/login', (req, res) => {
  res.render('user/login', { "userLoginError": req.session.userLoginError })
  req.session.userLoginError = false
})

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.userDetails = response.user;
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
      req.session.userLoginError = "Incorrect PhoneNumber or password ";
      res.redirect("/login");
    }
  })


})

router.post('/verify-login/:phone', (req, res) => {
  console.log(req.params.phone, req.body);
  client
    .verify
    .services(serviceid)
    .verificationChecks
    .create({
      to: `+91${req.params.phone}`,
      code: req.body.code
    }).then((data) => {
      if (data.status == "approved") {
        req.session.user = req.session.userDetails
        req.session.loggedIn = true;
        res.redirect('/')
      } else {
        req.session.user = false;
        req.session.loggedIn = false
        res.render('user/verify-login', { error: "invalid code", "phone": req.params.phone })
      }

    })
})

router.get('/details/:id', (req, res) => {
  userHelpers.viewDetails(req.params.id).then((movieDetails) => {
    console.log(movieDetails);
    res.render('user/view-details', { movieDetails })
  })
})

router.get('/seat-layout', verifyLogin, async (req, res) => {

  let screenDetails = await userHelpers.getScreenD("5fe1da06a2b229094406c945")

  userHelpers.getBookedSeats("5fe3294473a38755b8310923").then((showDeatils) => {
    console.log(showDeatils.premium);
    res.render('user/seat-layout', { screenDetails, "showDeatils": showDeatils })
  })

})



router.get('/video-play', (req, res) => {
  res.render('user/video-play')
})

router.get('/time', (req, res) => {
  res.render('user/pick-time')
})

//book seats
router.post('/book-seats', verifyLogin, async (req, res) => {
  let response = await userHelpers.getBookedSeat('5fe3294473a38755b8310923', req.body)
  let insert = await userHelpers.insertBookedSeats(req.body)
  let date=new Date()
  console.log(req.body);
  if (response.status) {
    console.log(response.price);
    res.render('user/checkout',{"price":response.price,"tickets":response.seatsDetails,date,"movie":response.show[0]})
  } else {
    console.log('err');
  }
})


module.exports = router;
