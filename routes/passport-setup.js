var userHelpers = require('../helpers/user-helpers')
const passport=require('passport')
var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
    

  });
  
  passport.deserializeUser(function(user, done) {
    
      done(null, user);
  
  });
passport.use(new GoogleStrategy({
    clientID: "1092647642534-62al50lp9fq55dj10vok781064po6icv.apps.googleusercontent.com",
    clientSecret: "hvVpXhzOzi5WYrwtIrFvbmzC",
    callbackURL: "https://www.moviebooking.site/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
   
      return done(null, profile);
  
  }
));