'use strict';

/**
 * @author Richard O'Brien <richard@stichmade.com>
 */

var request = require('request');
var _ = require('lodash');
var moment = require('moment');
var q = require('q');
var crypto = require('crypto');
var common = require('evergram-common');
var config = require('../../../config');
var trackingManager = require('../tracking');
var userManager = common.user.manager;
var logger = common.utils.logger;
var imagesetManager = require('../imagesets');
var facebookImageMapper = common.mapper.facebookImage;

/**
 * A service that handles all Facebook posts
 *
 * @constructor
 */
function Posts() {
}

/**
 * Starting point for all posts received via the api
 * @param Object entry: facebook entry sent to the api that notifies what changed
 */
function process(entry) {
    var deferred = q.defer();

    var userid = entry.uid;
    var photoid = entry.id;

    // Check this is a Pixy user
    userManager.find({ criteria: { 'facebook.id': ''+userid+'' }}).
    then(function(user) {
        if(!user) {
            logger.info("FB Post: User not found");
            // Not a pixy user, so do nothing.
            // TODO (stretch): respond with a comment prompting to signup?
            return deferred.resolve();
        }

        // Is a pixy user so... Get photo with that ID from fb
        getPhoto(user,photoid).
        then(function(photo){

            processPhoto(photo, user).
            then(function(result) {
                return deferred.resolve();
            }).
            fail(function(err) {
                logger.err('FB Posts: ' + err);
                return deferred.reject(err);
            });;

        }).
        fail(function(err) {
            logger.err('FB Posts: ' + err);
            return deferred.reject(err);
        });
    }).fail(function(err) {
        logger.err('FB Posts: ' + err);
        return deferred.reject(err);
    });

    return deferred.promise;
};

Posts.prototype.process = process

/**
 *  Get photo from fb
 *
 */
function getPhoto(user, fbPhotoId) {

    var deferred = q.defer();

    request({
        url: 'https://graph.facebook.com' + config.facebook.api + fbPhotoId + '?fields=id,name,picture,comments.order(reverse_chronological)',
        qs: {
            access_token:user.facebook.authToken, 
            appsecret_proof: generateSecret(user.facebook.authToken)
        },
        method: 'GET',
        json: true
      }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            logger.log('FB Post: Photo found + ' + JSON.stringify(body));
            return deferred.resolve(body);
        } else {
            logger.error('FB Post: Error getting photo: ', error);
            deferred.reject(error);
        }
    });

    return deferred.promise;
}


/**
 *  Calculate the most appropriate print dimensions for this photos (e.g. 6x4, 4x4, etc.)
 *  @return String: best print dimension (e.g. "6x4", etc.)
 *
 */
function getDimensions(image) {

    if (image.height === image.width) {
        return config.print.sizes['SQUARE'];
    } else {
        return config.print.sizes['STANDARD'];
    }
}


/**
 *  Processes a message (messaging object) if it contains image attachements
 */
function processPhoto(photo,user) {

    var deferred = q.defer();

    if (!!photo) {
        // And process post...
        if (!!user.instagram.activeService) {
            // If IG is activeService, check if photo was uploaded via instagram & ignore if so.
            if (photo.album === 'Instagram Photos') {
                // uploded via instagram so ignore this photo.
                return deferred.resolve();
            }
        }

        // Is @printwithpixy present in caption (name) or is @printwithpixy in comments
        if (hasTag(photo, user)) {
            
            // use image dimensions to workout appropriate print size
            var images = []; // create array so we can pass to saveImages method (will only ever contain 1 image)
            photo.images[0].printSize = getDimensions(photo.images[0]); // add print dimension to image object.
            var image = facebookImageMapper.toModel(photo, user);
            images.push(image);
            
            // then save photo to s3 & track
            //pass array to imageset manager.
            imagesetManager.saveImages(user,images).
            then(function(imageset) {     
                logger.info('FB Post: Images successfully saved for user ' + user.getUsername());
                return deferred.resolve();
            }).fail(function(err) {
                logger.err('FB Post: ' + err);
                return deferred.reject(err);
            });
        } else {
            // photo doesn't contain tag so ignore it
            return deferred.resolve();
        }
        

    } else {
        logger.err('FB Post: Photo not found (fbid:' + photoid + ')');
        return deferred.reject('FB Post: Photo not found (fbid:' + photoid + ')');
    }

    return deferred.promise;
}



/**
 * Test if photo name or comments contain the tag.
 * @return: Boolean
 */
function hasTag(photo, user) {
    var deferred = q.defer();

    if (!!photo.name && containsTag(photo.name)) {
        return q.fcall(function() {
                return true;
            });
    } else if (photo.comments.data.length > 0) {
        hasTagInComments(photo.comments, user)
        .then( function(tagFound) {
            return tagFound;
        });
    }

    return deferred.promise;
}

/**
 * Test if photo name or comments contain the tag.
 * @return: Boolean
 */
function hasTagInComments(comments, user) {
    var deferred = q.defer();
    // ###### TODO: TEST paging through comments works. ########
    checkComments(comments,user)
    .then(function(result) {
        return deferred.resolve(result);
    });

    return deferred.promise;
}


/**
 * Loop through the provided comments looking for posts from this user and checking if contains the print tag. 
 * If not, check if there is another page and recursively check those.
 * @return: Boolean|promise
 */
function checkComments(comments, user) {
    var deferred = q.defer();

    // loop through subsequent pages of comments
    _.forEach(comments.data, function(comment) {
        if (comment.from.id === user.facebook.id && containsTag(comment.message)) {
            return q.fcall(function() {
                    return true;
                });
        }
    });

    if (!!comments.paging && !!comments.paging.next) {
        return request({
            url: comments.paging.next + '?fields=created_time,from,message,id,order{reverse_chronological}',
            qs: {
                access_token:user.facebook.authToken, 
                appsecret_proof: generateSecret(user.facebook.authToken)
            },
            method: 'GET',
            json: true
        }, function(nextPageComments) {
            return checkComments(nextPageComments,user);
        });
    } else {
        return q.fcall(function() {
            return false;
        });
    }

    return deferred.promise;
}


/**
 *  Generate a SHA256 hash for appsecret signing
 *
 */
function generateSecret(access_token) {

    return crypto.createHmac('sha256',common.config.fb.clientSecret).update(access_token);
}

/**
 * Checks if the text contains an ignore tag
 *
 * @param text
 * @returns {boolean}
 */
function isIgnored(text) {
    return getIgnoreTagRegex().test(text.toLowerCase());
}

/**
 * The ignore regex.
 *
 * @returns {RegExp}
 */
function getIgnoreTagRegex() {
    return new RegExp(config.ignoreTag, 'g');
}

/**
 * Tests if the string contains the print tag.
 *
 * @param text
 * @returns {boolean}
 */
function containsTag(text) {
    return getPrintTagRegex().test(text.toLowerCase());
}

/**
 * Gets the first tag recognized in the passed string.
 *
 * @param text
 * @returns {String}
 */
function getPrintTag(text) {
    return text.toLowerCase().match(getPrintTagRegex())[0];
}

/**
 * Gets a regular expression from the passed config.
 *
 * @returns {RegExp}
 */
function getPrintTagRegex() {
    return new RegExp(config.printTag, 'g');
}

/**
 * Expose
 * @type {MessengerService}
 */
module.exports = exports = new Posts();
