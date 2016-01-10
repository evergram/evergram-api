/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

var moment = require('moment');
var common = require('evergram-common');
var logger = common.utils.logger;
var trackingManager = common.tracking.manager;

/**
 * A tracking manager that handles all tracking events for the instagram consumer
 *
 * @constructor
 */
function TrackingManager() {

}

TrackingManager.prototype.trackConnectedService = function(user, service) {
    var event = 'Connected a service';

    logger.info('Tracking "' + event + '" for ' + user.getUsername());

    return trackingManager.trackEvent(user, event, {
        service: service,
        instagramUsername: user.instagram.username
    }, moment().toDate());
};

TrackingManager.prototype.trackSignedUp = function(user) {
    var event = 'Signed up';

    logger.info('Tracking "' + event + '" for ' + user.getUsername());

    return trackingManager.createUser(user).
        then(function() {
            return trackingManager.trackEvent(user, event, {}, moment(user.signupCompletedOn).toDate());
        });
};

TrackingManager.prototype.trackLogin = function(user) {
    var event = 'Logged in';

    logger.info('Tracking "' + event + '" for ' + user.getUsername());

    return trackingManager.trackEvent(user, event, {}, moment().toDate());
};

/**
 * Expose
 * @type {TrackingManagerService}
 */
module.exports = exports = new TrackingManager();
