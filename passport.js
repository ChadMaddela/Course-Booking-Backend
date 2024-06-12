require('dotenv').config();
const passport = require("passport");

const GoogleStrategy = require('passport-google-oauth20').Strategy;


	// This configures Passport to use the Google Auth 2.0 authentication strategy.
	// Uses the Google API COnsole project OAuth Client ID Credentials (e.g. clientID and clientSecret)
	// "callbackURL" is the defined route on how the request will be handled later once a Google Login has been implemented
passport.use(new GoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: "https://course-booking-a5d56c632e96.herokuapp.com/",
	passReqToCallback: true
	},

		// This is the callback function that gets executed when a user is successfully authenticated.
		// returns the "profile" of the email used in the Google Login containing the user information (e.g. email, firstname, lastname)
	function(request, accessToken, refreshToken, profile, done) {

		// "done" is a parameter used in the function that functions as a callback.
	    // "done" is considered as a naming convention for callbacks.
	    // Callbacks are executed only when called inside the function they are defined in
		return done(null, profile)
	}
	));

	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(user, done) {
		done(null, user);
	});