'use strict';

/**
 * @author Richard O'Brien <richard@stichmade.com>.
 */

var _ = require('lodash');
var moment = require('moment');
var q = require('q');
var path = require('path');
var common = require('evergram-common');
var config = require('../../../config');
var trackingManager = require('../tracking');
var printManager = common.print.manager;
var userManager = common.user.manager;
var imageManager = common.image.manager;
var s3 = common.aws.s3;
var s3Bucket = common.config.aws.s3.bucket;
var logger = common.utils.logger;
var filesUtil = common.utils.files;

/**
 * A service that handles all interactions with a user's imageset
 *
 * @constructor
 */
function ImagesetManager() {
}


/**
 * TODO: DON'T NEED THIS IN IT'S CURRENT FORM...
 * - TAKE IMAGES AS PARAMETER & SAVE TO IMAGESET
 * - STRETCH GOAL: IF USER IS ON LIMIT PLAN, NEED TO NOTIFY THAT LIMIT HAS BEEN REACHED.
 *
 * @param user
 * @returns {*}
 */
function saveImages(user,images) {
    var dateRun = new Date();

    logger.info("saving...");
    /**
     * process any previous image sets that haven't been closed out
     */
    return processReadyForPrintImageSet(user).
        then(function() {
            /**
             * process the current images
             */
            return processCurrentImageSet(user,images);
        });
}

ImagesetManager.prototype.saveImages = saveImages;

/**
 * This is the current period image set
 */
function processCurrentImageSet(user,images) {
    logger.info('FB Messenger: Processing uploaded images for ' + user.getUsername());

    return printManager.findCurrentByUser(user).
        then(function(imageSet) {
            if (!imageSet) {
                imageSet = printManager.getNewPrintableImageSet(user);
            }

            return processPrintableImageSet(user, imageSet, images);
        });
}

ImagesetManager.prototype.processCurrentImageSet = processCurrentImageSet;

/**
 * These are image sets that are past their period, but have not
 * yet been marked as "ready for print"
 *
 */
function processReadyForPrintImageSet(user) {
    var numberOfPeriods = user.getCurrentPeriod();
    logger.info('FB Messenger: ' + user.getUsername() + ' is in period ' + numberOfPeriods);

    if (numberOfPeriods > 0) {
        logger.info('FB Messenger: Checking previous ready for print images for ' + user.getUsername());

        return printManager.findPreviousByUser(user).
            then(function(imageSet) {
                if (!!imageSet && !imageSet.isReadyForPrint) {
                    return processPrintableImageSet(user, imageSet).
                        then(function() {
                            //save the image set
                            //TODO move this to processPrintableImageSet so that we only save once.
                            imageSet.isReadyForPrint = true;
                            return printManager.save(imageSet);
                        });
                } else {
                    logger.info('FB Messenger: There are no previous incomplete image sets for ' + user.getUsername());
                    return q.fcall(function() {
                        return true;
                    });
                }
            });
    } else {
        //TODO figure out a way to remove this as it's messy
        return q.fcall(function() {
            return true;
        });
    }
}

ImagesetManager.prototype.processReadyForPrintImageSet = processReadyForPrintImageSet;

/**
 * Finds and saves images for the passed user and image set.
 *
 * @param user
 * @param printableImageSet
 * @returns {*}
 */
function processPrintableImageSet(user, printableImageSet, images) {

    var deferred = q.defer();

    logger.info('FB Messenger: Saving ' + images.length + ' images to current imageset for ' + user.getUsername() + ' for the set ' + printableImageSet.startDate);

    /**
     * Track the images
     */
    if (images.length > 0 && (!!config.track && config.track !== 'false' && config.track !== false)) {
        trackingManager.trackTaggedImages(user, printableImageSet, images);
    }

    /**
     * Save new images to user's s3 bucket
     */
    saveImagesToS3(user,images,printableImageSet,'facebook').
    then(function() {
        /**
         * Add the new images.
         */
        addImages(user, printableImageSet, images);

        logger.info('Saving image set ' + printableImageSet._id + ' for ' + user.getUsername());

        /**
         * Save to db.
         */
        printManager.save(printableImageSet).
        then(function() {
            deferred.resolve();
        });
    });

    return deferred.promise
}

ImagesetManager.prototype.processPrintableImageSet = processPrintableImageSet;


/**
 * Saves all images from an image set in a local temp directory.
 *
 * @param user
 * @param imageSet
 * @returns {promise|*|Q.promise}
 */
function saveImagesToS3(user, images, printableImageSet, service) {
    var deferred = q.defer();
    var imagesDeferred = [];
    var tmpdir = getUserDirectory(user);
    var dir = getUserDirectory(user) + '/' + getImageSetDirectory(printableImageSet) + '/facebook';

    logger.info('Saving images for ' + user.getUsername() + ' to S3 Bucket');

    if (images.length > 0 && !!user[service]) {
        _.forEach(images, function(image) {
            var imgDeferred = q.defer();
            imagesDeferred.push(imgDeferred.promise);

            var imgFileName = user.facebook.id + '_' + path.basename(image.src.raw);

            imageManager.saveFromUrl(image.src.raw, imgFileName, tmpdir).
                then(function(savedFilepath) {
                    var filename = config.s3.folder + '/' + dir + '/' + path.basename(savedFilepath);
                    
                    s3.create(savedFilepath, {
                            bucket: s3Bucket,
                            key: filename,
                            acl: 'public-read'
                    }).
                    then(function(s3File) {
                        logger.info('Saved file to: ' + decodeURIComponent(s3File.Location));
                        image.src.raw = decodeURIComponent(s3File.Location);
                        imgDeferred.resolve();
                    }).fail(function(err) {
                        logger.info('Error saving file ' + imgFileName + ' to s3: ' + err);
                        imgDeferred.reject(err);
                    });
                    
                }).fail(function(err) {
                    logger.info('Error saving file ' + imgFileName + ' from URL: ' + err);
                    imgDeferred.reject(err);
                });
        });
    }

    return q.all(imagesDeferred).finally(function() {
                // cleanup temp files
                filesUtil.deleteDirectory(config.tempDirectory + tmpdir);
            });
}

ImagesetManager.prototype.saveImages = saveImages;


/**
 * A user directory where we can store the user specific files
 *
 * @param user
 * @returns {string}
 */
function getUserDirectory(user) {
    return user.getUsername();
}

ImagesetManager.prototype.getUserDirectory = getUserDirectory;


/**
 * Gets a nicely formatted file name
 *
 * @param user
 * @param imageSet
 * @returns {string}
 */
function getImageSetDirectory(imageSet) {
    return imageSet.period + '-' + moment(imageSet.startDate).format('YYYY-MM-DD') +
        '-to-' +
        moment(imageSet.endDate).format('YYYY-MM-DD');
}

/**
 * Add the found images to the image set.
 *
 * @param user
 * @param printableImageSet
 * @param images
 */
function addImages(user, printableImageSet, images) {
    printableImageSet.addImages('facebook', images);
}

/**
 * Expose
 * @type {ImagesetManager}
 */
module.exports = exports = new ImagesetManager();