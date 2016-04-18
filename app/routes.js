/**
 * Module dependencies.
 */

var express = require('express');
var router = express.Router();
var passport = require('passport');
var cors = require('cors');
var config = require('./config');
var controllers = require('./controllers');

/**
 * Enable CORS on all requests
 */
router.use(cors());
router.options('*', cors());

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
 * Facebook auth
 */
router.get(
    '/auth/facebook',
    controllers.authentication.beginFacebook,
    passport.authenticate('facebook', {
        scope: ['email','user_friends','user_photos','user_posts'],
        failureRedirect: config.facebook.redirect.fail
    })
);

router.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', {
        scope: ['email','user_friends','user_photos','user_posts'],
        failureRedirect: config.facebook.redirect.fail
    }),
    controllers.authentication.callbackFacebook
);

/**
 * facebook webhooks
 */
//router.get('/facebook/webhook', controllers.facebook.verify);
//router.post('/facebook/webhook', controllers.facebook.postReceived);
router.get('/facebook/messenger/webhook', controllers.facebook.verify);
router.post('/facebook/messenger/webhook', controllers.facebook.messageReceived);


/**
 * User
 */
// TODO unblock the users endpoint when we have time to put security in.
//router.get('/users', controllers.users.getList);
router.get('/users/:id', controllers.users.get);
router.post('/users', controllers.users.create);
router.patch('/users/:id', controllers.users.update);
router.put('/users/:id', controllers.users.update);

/**
 * Payment Gateways
 */
router.post('/payment-gateways/stripe/customer',
    controllers.paymentGateways.stripe.customer.create);
router.patch('/payment-gateways/stripe/customer/:id',
    controllers.paymentGateways.stripe.customer.update);
router.put('/payment-gateways/stripe/customer/:id',
    controllers.paymentGateways.stripe.customer.update);

/**
 * Events / Tracking
 */
router.post('/events/signed-up', controllers.events.signedUp.create);

/**
 * images
 */
router.get('/users/:userid/image-sets', controllers.imageSets.getAll);
router.get('/users/:userid/image-sets/current', controllers.imageSets.getCurrent);
router.get('/users/:userid/image-sets/:id', controllers.imageSets.getById);

/**
 * Error handling
 */
router.use(function(req, res) {
    res.status(404).send('Page Not Found');
});

module.exports = router;
