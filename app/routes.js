/*!
 * Module dependencies.
 */

var express = require('express');
var router = express.Router();
var passport = require('passport');
var controllers = require('./controllers');

/**
 * General
 */
router.get('/', function (req, res) {
    res.send('ping');
});
/**
 * Instagram auth
 * ISSUE: BY REDIRECTING TO CALLBACK WHEN DONE, WE LOOSE KNOWLEDGE OF WHO THE CALLER WAS (E.G. SQUARESPACE) SO HOW CAN WE RETURN SUCCESS?
 * - OPTION: keep using OAuth.io for auth, and only use creataccount endpoint to save data (same as current process)
 * - OPTION: keep using OAuth.io for auth, on page load of step 2 save auth data using a createUser (or something) end point and 
 *           then use a second endpoint to save data once user has completed step 2.
 *  Q. Do we get enough data from OAuth.io for what we need? Might need to make additional calls to IG from our endpoint to get additional user data
 */
router.get('/user/auth/instagram', passport.authenticate('instagram', {
    failureRedirect: '/error'	// ???? does this even do anything???
}));

router.get('/user/auth/instagram/callback', passport.authenticate('instagram', {
    failureRedirect: '/error'
}), controllers.users.saveAuthentication);


/**
 * Squarespace Signup/Registration
 */


router.get('/user/signup/create-account', function(req, res) {
	controllers.users.createAccount(req, res);
});


/**
 * Error handling
 */
router.use(function (req, res, next) {
    res.status(404).send('Page Not Found');
});


module.exports = router;