/*!
 * Module dependencies.
 */

var express = require('express');
var router = express.Router();
var passport = require('passport');
var common = require('evergram-common');
var controllers = require('./controllers');
var trackingManager = require('./tracking');
var logger = common.utils.logger;
var objectUtil = common.utils.object;

/**
 * General
 */
router.get('/', function(req, res) {
    res.send('ping');
});

/**
 * Instagram auth
 */
router.get('/user/auth/instagram', function(req, res, next) {
    //TODO move to contorller
    logger.info('Start Instagram Auth');

    // allows us to pass through any querystring params
    req.session.params = objectUtil.param(req.query);
    next();

}, passport.authenticate('instagram', {
    failureRedirect: common.config.instagram.redirect.fail
}));

router.get('/user/auth/instagram/callback', passport.authenticate('instagram', {
    failureRedirect: common.config.instagram.redirect.fail
}), function(req, res) {
    //TODO move this to a controller.
    logger.info('Instagram Auth complete for ' + req.user.instagram.username + ' (id: ' + req.user._id + ')');

    // remember user object for session.
    req.session.userid = req.user._id;

    // append any querystring params that were passed
    var params = req.session.params + '&id=' + req.session.userid;
    delete req.session.params;

    //if signup is already complete, redirect to the re-auth page.
    //TODO make all these redirects a little more obvious.
    if (!!req.user.signupComplete) {
        res.redirect(common.config.instagram.redirect.reauth);
    } else {
        trackingManager.trackConnectedService(req.user, 'Instagram');
        res.redirect(common.config.instagram.redirect.success + params);
    }
});

/**
 * Squarespace Signup/Registration
 */
router.post('/user/:id', function(req, res) {
    controllers.users.saveAccountDetails(req.params.id, req, res);
});

/**
 * Not needed yet but will be in future.
 */
router.get('/user', function(req, res) {
    controllers.users.getList(req, res);
});

/**
 * Error handling
 */
router.use(function(req, res, next) {
    res.status(404).send('Page Not Found');
});

module.exports = router;