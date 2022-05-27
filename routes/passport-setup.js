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
  clientID: "574519925363-j4dcaeftag0vavd39ffgnsn6lngr9vqn.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "http://localhost:3000/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
   
      return done(null, profile);
  
  }
));