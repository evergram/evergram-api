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
 */
router.get('/user/auth/instagram', passport.authenticate('instagram', {
    failureRedirect: '/login'
}), controllers.users.login);

router.get('/user/auth/instagram/callback', passport.authenticate('instagram', {
    failureRedirect: '/login'
}), controllers.users.login);

/**
 * Error handling
 */
router.use(function (req, res, next) {
    res.status(404).send('Page Not Found');
});


module.exports = router;