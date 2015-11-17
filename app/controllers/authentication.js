/**
 * @author Richard O'Brien <richard@stichmade.com>
 */

var common = require('evergram-common');
var trackingManager = require('../tracking');
var logger = common.utils.logger;
var objectUtil = common.utils.object;

var REDIRECT_URL_KEY = 'redirect_url';
var AUTH_ACTION_KEY = 'action';
var AUTH_ACTIONS = {
    SIGNUP: 'signup',
    REAUTH: 'reauth'
};

/**
 * Module dependencies.
 */

var AuthenticationController = function() {
    //constructor does nothing
};

/**
 * Starts the instagram oauth.
 *
 * Checks the querystring for "action" and "redirect" and set it on the session to be used in
 * {@link AuthenticationController#callbackInstagram}.
 *
 * @param req
 * @param res
 * @param next
 */
AuthenticationController.prototype.beginInstagram = function(req, res, next) {
    logger.info('Start Instagram Auth');

    // allows us to pass through any querystring params
    // get the redirect query if it is present in the querystring
    req.session.auth = {
        action: req.query[AUTH_ACTION_KEY],
        redirectUrl: req.query[REDIRECT_URL_KEY]
    };
    delete req.query[AUTH_ACTION_KEY];
    delete req.query[REDIRECT_URL_KEY];

    //save the querystring to session so we can use it in the callback
    req.session.auth.params = req.query;

    next();
};

/**
 * Handles the instagram callback.
 *
 * Checks the session for "action" and "redirect" which was set in {@link AuthenticationController#beginInstagram}.
 *
 * @param req
 * @param res
 */
AuthenticationController.prototype.callbackInstagram = function(req, res) {
    var user = req.user;
    var session = req.session;
    var action = session.auth.action;

    logger.info('Instagram Auth complete for ' + user.instagram.username + ' (id: ' + user._id + ')');

    //check for url redirect
    var redirect = session.auth.redirectUrl;

    // append any querystring params that were passed
    var params = objectUtil.param(req.session.auth.params) + '&id=' + user._id;

    //handle signup
    if (!action || action === AUTH_ACTIONS.SIGNUP) {
        if (user.signupComplete === true) {
            logger.info('User attempted to signup but account already registered (' + user.instagram.username + ').');
            redirect = common.config.instagram.redirect.fail;
        } else {
            trackingManager.trackConnectedService(user, 'Instagram');
            if (!redirect) {
                redirect = common.config.instagram.redirect.success;
            }
        }
    } else if (action === AUTH_ACTIONS.REAUTH) {
        if (user.signupComplete === true) {
            trackingManager.trackConnectedService(user, 'Instagram');
            if (!redirect) {
                redirect = common.config.instagram.redirect.reauth;
            }
        } else {
            if (!redirect) {
                redirect = common.config.instagram.redirect.success;
            }
        }
    }

    logger.info('Redirecting to ' + redirect + params);

    res.redirect(redirect + params);
};

/**
 * Expose
 * @type {UserController}
 */
module.exports = exports = new AuthenticationController();
