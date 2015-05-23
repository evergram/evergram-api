/*!
 * Module dependencies.
 */

var express = require('express');
var router = express.Router();
var passport = require('passport');
var cors = require('cors');
var config = require('evergram-common').config;
var controllers = require('./controllers');

/**
 * Enable CORS on all requests
 */
router.use(cors());
router.options('*', cors());

/**
 * General
 */
router.get('/', function(req, res) {
    res.send('ping');
});

/**
 * Instagram auth
 */
router.get(
    '/auth/instagram',
    controllers.authentication.beginInstagram,
    passport.authenticate('instagram', {
        failureRedirect: config.instagram.redirect.fail
    })
);

router.get(
    '/auth/instagram/callback',
    passport.authenticate('instagram', {
        failureRedirect: config.instagram.redirect.fail
    }),
    controllers.authentication.callbackInstagram
);

/**
 * Users
 */
router.get('/user', controllers.users.getList);
router.get('/user/:id', controllers.users.get);
router.post('/user', controllers.users.create);
router.put('/user/:id', controllers.users.updateLegacy);
router.post('/user/:id/payment', controllers.users.createPayment);

/**
 * Error handling
 */
router.use(function(req, res) {
    res.status(404).send('Page Not Found');
});

module.exports = router;
