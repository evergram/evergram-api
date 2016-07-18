/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

var _ = require('lodash');
var moment = require('moment');
var q = require('q');
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

    var serviceId, serviceUsername;

    if (service === 'Instagram') {
        serviceId = user.instagram.id;
        serviceUsername = user.instagram.username;
    } else if (service === 'Facebook') {
        serviceId = user.facebook.id;
        serviceUsername = '';
    }

    return trackingManager.trackEvent(user, event, {
        service: service,
        serviceId: serviceId,
        serviceUsername: serviceUsername
    }, moment().toDate());
};

TrackingManager.prototype.trackSignedUp = function(user) {
    var event = 'Signed up';

    logger.info('Tracking "' + event + '" for ' + user.getUsername());

    return trackingManager.createUser(user).
        then(function() {
            return trackingManager.trackEvent(user, event, {
                referringUser: user.referringUser.instagramUsername
            }, moment(user.signupCompletedOn).toDate());
        });
};

TrackingManager.prototype.trackLogin = function(user) {
    var event = 'Logged in';

    logger.info('Tracking "' + event + '" for ' + user.getUsername());

    return trackingManager.trackEvent(user, event, {}, moment().toDate());
};

/**
 * Tracks tagged facebook images.
 *
 * @param user
 * @param imageSet
 * @param images
 */
TrackingManager.prototype.trackUploadedImages = function(user, imageSet, images) {
    var deferreds = [];
    var event = 'Tagged a photo';
    var numberOfImages = imageSet.getNumberOfImages();
    var numberOfNewImages = 0;

    _.forEach(images, function(image) {
        numberOfNewImages++;

        var deferred = trackingManager.trackEvent(user, event, {
            service: 'messenger',
            email: user.email,
            plan: user.billing.option,
            type: 'own',
            image: image.src.raw,
            tag: 'Facebook Messenger Upload',
            period: user.getPeriodFromStartDate(imageSet.startDate),
            createdOn: moment(image.taggedOn).toDate(),
            taggedOn: moment(image.taggedOn).toDate(),
            count: (numberOfImages + numberOfNewImages)
        }, image.taggedOn);

        deferreds.push(deferred);
    });

    logger.info('Tracking ' + event + ' for ' + numberOfNewImages + ' new images for ' + user.getUsername());

    return q.all(deferreds);
};

/**
 * Expose
 * @type {TrackingManagerService}
 */
module.exports = exports = new TrackingManager();
