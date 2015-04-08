/*!
 * Module dependencies.
 */

var express = require('express');
var router = express.Router();
var passport = require('passport');
var common = require('evergram-common');
var controllers = require('./controllers');

/**
 * General
 */
router.get('/', function (req, res) {
    res.send('ping');
});
/**
 * Instagram auth
 */
router.get('/user/auth/instagram', function(req, res, next) {
	  // allows us to pass through any querystring params
	req.session.params = serializeQueryString(req.query);
	next();
	}, passport.authenticate('instagram', {
		failureRedirect: common.config.instagram.redirect.fail
}));

router.get('/user/auth/instagram/callback', passport.authenticate('instagram', {
    failureRedirect: common.config.instagram.redirect.fail
	})
	, function(req, res) {

	  console.log("session id = " + req.session.userid)
	  // remember user object for session.
	  req.session.userid = req.user._id;

	  // append any querystring params that were passed
	  var params = req.session.params + "&id=" + req.session.userid;
	  delete req.session.params;
	  console.log("querystring post callback=" + params);
	  res.redirect(common.config.instagram.redirect.success + params);
});

/* 
 * Used to serialize the querystring so we can pass via the session to the callback
 */
function serializeQueryString( obj ) {
  return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
}

/**
 * Squarespace Signup/Registration
 */
router.post('/user/:id', function(req, res) {
	console.log("session id = " + req.params.id)
	controllers.users.saveAccountDetails(req.params.id, req, res);
});

/*
 * Not needed yet but might be in future.
 */
/*router.get('/user/', function(req, res) {
	controllers.users.findUser(req, res);
});*/


/**
 * Error handling
 */
router.use(function (req, res, next) {
    res.status(404).send('Page Not Found');
});


module.exports = router;