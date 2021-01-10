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
    clientID: "1081598155831-5fjmd3hdbq3k3futd9pmk0547j3a8eeb.apps.googleusercontent.com",
    clientSecret: "C8-kpCBRSMn0heG0qOazZcYG",
    callbackURL: "http://139.59.65.117:3000/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
   
      return done(null, profile);
  
  }
));