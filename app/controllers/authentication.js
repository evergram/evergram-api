/**
 * @author Richard O'Brien <richard@stichmade.com>
 */

var common = require('evergram-common');
var trackingManager = require('../tracking');
var logger = common.utils.logger;
var objectUtil = common.utils.object;

var REDIRECT_URL_KEY = 'redirect_url';
var REFERRING_USER_KEY = 'referring_user';
var AUTH_ACTION_KEY = 'action';
var AUTH_ACTIONS = {
    SIGNUP: 'signup',
    LOGIN: 'login',
    REAUTH: 'reauth'
};

/**
 * Module dependencies.
 */

var AuthenticationController = function() {
    //constructor does nothing
};


/**
 * Starts the facebook oauth.
 *
 * Checks the querystring for "action" and "redirect" and set it on the session to be used in
 * {@link AuthenticationController#callbackFacebook}.
 *
 * @param req
 * @param res
 * @param next
 */
AuthenticationController.prototype.beginFacebook = function(req, res, next) {
    logger.info('Start Facebook Auth');

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
 * Handles the facebook callback.
 *
 * Checks the session for "action" and "redirect" which was set in {@link AuthenticationController#beginFacebook}.
 *
 * @param req
 * @param res
 */
AuthenticationController.prototype.callbackFacebook = function(req, res) {
    var user = req.user;
    var session = req.session;
    var action = session.auth.action;

    logger.info('Facebook Auth complete for ' + user.firstName + ' ' + user.lastName + ' (id: ' + user._id + ', email: ' + user.email + ')');

    //check for url redirect
    var redirect = session.auth.redirectUrl;

    // append any querystring params that were passed
    var params = objectUtil.param(req.session.auth.params) + '&id=' + user._id;

    //handle signup
    if (!action || action === AUTH_ACTIONS.SIGNUP) {
        if (user.signupComplete === true) {
            logger.info('User attempted to signup but account already registered (id: ' + user._id + ', email: ' + user.email + ').');
            redirect = common.config.facebook.redirect.fail;
        } else {
            trackingManager.trackConnectedService(user, 'Facebook');
            if (!redirect) {
                redirect = common.config.facebook.redirect.success;
            }
        }
    } else if (action === AUTH_ACTIONS.LOGIN) {
        if (user.signupComplete === true) {
            trackingManager.trackLogin(user, 'Facebook');
            if (!redirect) {
                redirect = common.config.facebook.redirect.loginSuccess;
            }
        } else {
            // Redirect back to login screen with err message as param
            redirect = common.config.facebook.redirect.loginFail;
            logger.info('User attempted to login but doesn\'t have a valid Pixy account.');
            params += '&err=' + encodeURIComponent('User account not found');
        }
    } else if (action === AUTH_ACTIONS.REAUTH) {
        if (user.signupComplete === true) {
            trackingManager.trackConnectedService(user, 'Facebook');
            if (!redirect) {
                redirect = common.config.facebook.redirect.reauth;
            }
        } else {
            if (!redirect) {
                redirect = common.config.facebook.redirect.success;
            }
        }
    }

    logger.info('Redirecting to ' + redirect + params);

    res.redirect(redirect + params);
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
        redirectUrl: req.query[REDIRECT_URL_KEY],
        referringUser: req.query[REFERRING_USER_KEY]
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
    } else if (action === AUTH_ACTIONS.LOGIN) {
        if (user.signupComplete === true) {
            trackingManager.trackLogin(user, 'Instagram');
            if (!redirect) {
                redirect = common.config.instagram.redirect.loginSuccess;
            }
        } else {
            // Redirect back to login screen with err message as param
            redirect = common.config.instagram.redirect.loginFail;
            logger.info('User attempted to login but doesn\'t have a valid Pixy account.');
            params += '&err=' + encodeURIComponent('User account not found');
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
