/**
 * @author Richard O'Brien <richard@stichmade.com>
 */

var common = require('evergram-common');
var trackingManager = require('../tracking');
var logger = common.utils.logger;
var objectUtil = common.utils.object;

/**
 * Module dependencies.
 */

var AuthenticationController = function() {
    //constructor does nothing
};

AuthenticationController.prototype.beginInstagram = function(req, res, next) {
    logger.info('Start Instagram Auth');

    // allows us to pass through any querystring params
    req.session.params = objectUtil.param(req.query);
    next();
};

AuthenticationController.prototype.callbackInstagram = function(req, res) {
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
};

/**
 * Expose
 * @type {UserController}
 */
module.exports = exports = new AuthenticationController();
