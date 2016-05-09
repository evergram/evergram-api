'use strict';
/**
 * @author Richard O'Brien <richard@stichmade.com>.
 */

var _ = require('lodash');
var q = require('q');
var moment = require('moment');
var common = require('evergram-common');
var logger = common.utils.logger;
var trackingManager = common.tracking.manager;

/**
 * A tracking manager that handles all tracking events for the Facebook Service
 *
 * @constructor
 */
function TrackingManager() {

}

/**
 * Tracks tagged facebook images.
 *
 * @param user
 * @param imageSet
 * @param images
 */
TrackingManager.prototype.trackTaggedImages = function(user, imageSet, images) {
    var deferreds = [];
    var event = 'Tagged a photo';
    var numberOfImages = imageSet.getNumberOfImages();
    var numberOfNewImages = 0;

    _.forEach(images, function(image) {
        if (!imageSet.containsImage('facebook', image)) {
            numberOfNewImages++;

            var deferred = trackingManager.trackEvent(user, event, {
                service: 'facebook',
                owner: image.owner,
                email: user.email,
                plan: user.billing.option,
                type: 'own',
                image: image.src.raw,
                tag: 'Facebook Post',
                period: user.getPeriodFromStartDate(imageSet.startDate),
                createdOn: moment(image.taggedOn).toDate(),
                taggedOn: moment(image.taggedOn).toDate(),
                count: (numberOfImages + numberOfNewImages)
            }, image.taggedOn);

            deferreds.push(deferred);
        }
    });

    logger.info('Tracking ' + event + ' for ' + numberOfNewImages + ' new images for ' + user.getUsername());

    return q.all(deferreds);
};

/**
 * Expose
 * @type {TrackingManagerService}
 */
module.exports = exports = new TrackingManager();
