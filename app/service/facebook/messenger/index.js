'use strict';

/**
 * @author Richard O'Brien <richard@stichmade.com>
 */

var request = require('request');
var _ = require('lodash');
var moment = require('moment');
var q = require('q');
var common = require('evergram-common');
var config = require('../../../config');
var trackingManager = require('../tracking');
var userManager = common.user.manager;
var logger = common.utils.logger;
var imagesetManager = require('../imagesets');
var facebookImageMapper = common.mapper.facebookMessengerImage;

/**
 * A service that handles all Facebook Messenger requests
 *
 * @constructor
 */
function Messenger() {
}

/**
 * Starting point for all messages received via the api
 * @param Object envelope: facebook message (messaging object) sent to the api
 */
function processMessage(envelope) {
    var deferred = q.defer();

    logger.info('FB Messenger: Processing Message');

    // Check this is a Pixy user (mid === facebook.messengerId)
    userManager.find({ criteria: { 'facebook.messengerId': ''+envelope.sender.id+'' }}).
    then(function(user) {
        
        if (!!user) 
            logger.info('FB Messenger: User found - ' + user._id);
        else
            logger.info('FB Messenger: User not found');

        /* Is a pixy user, so process message... types are...
         * - photo: uploads photo to current imageset, tracks photo, & responds with new photo count
         * - asking for help: return menu and email address
         * - ship date: returns next ship date & login link for admin
         * - photo count: returns current photo count & login link for admin
         * STRETCH GOAL: Implement Wit.ai
         */
        if(!!envelope.message.attachments) { // photo or sticker
            logger.info("FB Messenger: Type is image");

            if (!!envelope.message.sticker_id) {
                // user sent a fb sticker (e.g. thumbs up 369239263222822)
                // may want to so something about this in future but not for now. Could process as a 'Yes' or something and sent via processTextMessage()?
                logger.info("FB Messenger: Sticker ignored (sticker id: " + envelope.message.sticker_id + ")");
                return deferred.resolve();
            }

            if(!user) {
                logger.info("FB Messenger: User not found");
                // Not a pixy user, respond with a message prompting to signup or connet their account?
                var response = config.facebook.messengerResponses.ERROR.USER_NOT_FOUND || config.facebook.messengerResponses.ERROR.DEFAULT;
                response = replaceMergeFields(response, getMergeFields(user, envelope, null));

                sendResponse(envelope.sender.id, response);
                return deferred.resolve();
            } else {
                logger.info("FB Messenger: User found.");
                processPhotoMessage(envelope, user).
                then(function(response) {
                    sendResponse(envelope.sender.id, response);
                    return deferred.resolve();
                });
            }
        }
        else if(!!envelope.message.text) {   // text - will really only process if user types MENU, HELP, or a question to send to help@printwithpixy.com
            logger.info("FB Messenger: Type is text");
            processTextMessage(envelope, user).
            then(function(response) {
                // inject messengerId if required
                response = replaceMergeFields(response, getMergeFields(user, envelope, null));

                sendResponse(envelope.sender.id, response);
                return deferred.resolve();
            });
        } else { 
            logger.info("FB Messenger: Un-recognised message: " + JSON.stringify(envelope));
            deferred.reject();
        }
    }).fail(function(err) {
        logger.err('FB Messenger: ' + err);
        sendResponse(envelope.sender.id, config.facebook.messengerResponses.ERROR.DEFAULT);
        return deferred.reject(err);
    });

    return deferred.promise;
};

Messenger.prototype.processMessage = processMessage


/**
 * Starting point for all postbacks received via the api.
 * @param Object envelope: facebook postback (messaging object) sent to the api
 */
function processPostback(envelope) {
    var deferred = q.defer();

    logger.info("FB Messenger: Type is Postback");

    logger.info("FB Messenger: processPostback payload = " + envelope.postback.payload);

    // Check this is a Pixy user (mid === facebook.messengerId)
    userManager.find({ criteria: { 'facebook.messengerId': ''+envelope.sender.id+'' }}).
    then(function(user) {
        logger.info('### Returned from User search - ' + JSON.stringify(user));

        /* Types are...
         * - MENU
         * - HELP
         * - PHOTO_UPLOAD.START
         * - HELP.REQUEST
         */
        if(!!envelope.postback.payload) { // 
            var response;

            if (envelope.postback.payload === 'MENU') {
                // check if logged-in
                if(!user) {
                    logger.info("FB Messenger: User not found");
                    // Not a pixy user, respond with logged out menu
                    response = config.facebook.messengerResponses.MENU.DEFAULT;
                } else {
                    response = config.facebook.messengerResponses.MENU.LOGGED_IN;
                }

            } else if (envelope.postback.payload === 'GET_STARTED') {
                response = config.facebook.messengerResponses.GET_STARTED.DEFAULT;
            } else if (envelope.postback.payload === 'HELP') {
                response = config.facebook.messengerResponses.HELP.DEFAULT;
            } else if (envelope.postback.payload === 'HELP.REQUEST') {
                response = config.facebook.messengerResponses.HELP.REQUEST;
            } else if (envelope.postback.payload === 'PHOTO_UPLOAD.START') {
                response = config.facebook.messengerResponses.PHOTO_UPLOAD.DEFAULT;
            }

            // inject any variables into text & URLs if required
            response = replaceMergeFields(response, getMergeFields(user, envelope, null));

            sendResponse(envelope.sender.id, response);

            return deferred.resolve();
        } else { 
            logger.info("FB Messenger: Empty postback payload: " + JSON.stringify(envelope));
            deferred.reject();
        }
    }).fail(function(err) {
        logger.err('FB Messenger: ' + err);
        sendResponse(envelope.sender.id, config.facebook.messengerResponses.ERROR.DEFAULT);
        return deferred.reject(err);
    });

    return deferred.promise;
};

Messenger.prototype.processPostback = processPostback


/**
 *  Processes a message (messaging object) if it contains image attachements
 */
function processPhotoMessage(envelope,user) {

    var images = [];
    var deferred = q.defer();

    logger.info("FB Messenger: Processing photo");

    // for each image in attachements   - ### TODO: COULD BE ASYNC ISSUES WITH THIS???
    _.forEach(envelope.message.attachments, function(attachment) {
        // skip video & audio
        if(attachment.type === 'image') {
            logger.info('FB Messenger: processing image attachment.');

            var data = {
                mid: envelope.message.mid,
                timestamp: envelope.timestamp,
                attachment: attachment
            }

            var image = facebookImageMapper.toModel(data, user);
            images.push(image);
        } else {
            // ignore
            logger.info('FB Messenger: attachment of type ' + attachment.type + ' ignored.');
            // TODO: should probably send a friendly response (e.g. we don't print videos yo!)
        }
    });

    logger.info('FB Messenger: Saving ' + envelope.message.attachments.length + ' photo(s)');

    //pass array to imageset manager.
    imagesetManager.saveImages(user,images).
    then(function(imageset) {

        // TODO: printableImageSet is currently undefined. Need to update imagesets/index.js if we want to get the photo count for response message.
        
        logger.info('FB Messenger: Images successfully saved for user ' + user.getUsername());

        // inject any variables into text & URLs if required
        var response = replaceMergeFields(config.facebook.messengerResponses.PHOTO_UPLOAD.COMPLETE, getMergeFields(user, envelope, imageset)); 
        deferred.resolve(response);

    }).fail(function(err) {
        logger.err('FB Messenger: Failed to save image for user (id:' + user._id + ') - ' + err);
        var response = replaceMergeFields(config.facebook.messengerResponses.ERROR.UPLOAD_FAILED, getMergeFields(user, envelope, null));
        deferred.reject(response);
    });

    return deferred.promise;
}

/**
 *  Processes a message (messaging object) if it contains image attachements
 */
function processTextMessage(envelope, user) {
    var deferred = q.defer();

    logger.info("FB Messenger: Processing text - " + JSON.stringify(envelope));

    //TODO: handle various types of message.
    /* Types are...
     * - MENU
     * - HELP
     */
    if(!!envelope.message.text) { // 
        var response;

        if (envelope.message.text.toUpperCase() === 'MENU') {
            // check if logged-in
            if(!user) {
                logger.info("FB Messenger: User not found");
                // Not a pixy user, respond with logged out menu
                response = config.facebook.messengerResponses.MENU.DEFAULT;
            } else {
                logger.info("FB Messenger: User found - " + user._id);
                response = config.facebook.messengerResponses.MENU.LOGGED_IN;
            }

        } else if (envelope.message.text.toUpperCase() === 'HELP') {
            logger.info("FB Messenger: HELP menu requested by user.");
            response = config.facebook.messengerResponses.HELP.DEFAULT;
        } else {
            // user has said something other than a menu option
            logger.info('FB Messenger: Free-text from user - ' + envelope.message.text);

            // TODO: Is this a help request? How do we handle that?
            if (envelope.message.text.toLowerCase() === ('hi' || 'hello' || 'hey')) {
                // check if logged-in
                if(!user) {
                    logger.info("FB Messenger: User not found");
                    // Not a pixy user, respond with logged out menu
                    response = config.facebook.messengerResponses.GREETING.DEFAULT;
                } else {
                    logger.info("FB Messenger: User found - " + user._id);
                    response = config.facebook.messengerResponses.GREETING.LOGGED_IN;
                }
            } else {
                // respond with a helpful message
                response = config.facebook.messengerResponses.ERROR.UNKNOWN_INPUT;
            }
            return deferred.resolve();
        }

        // inject any variables into text & URLs if required
        response = replaceMergeFields(response, getMergeFields(user, envelope, null));

        sendResponse(envelope.sender.id, response);

        return deferred.resolve();
    }

    logger.info("FB Messenger: processTextMessage = " + envelope.message.text);
    deferred.resolve(config.facebook.messengerResponses.HELP.DEFAULT);

    return deferred.promise;
}


/**
 * Responsible for passing the response to the user's messenger client.
 * @param String recipient: the orginal senderid 
 * @param Object data: structured response from config.facebook.messengerResponses collection.
 */
function sendResponse(recipient,data) {

    logger.info('FB Messenger: Sending ' + data.response_id + ' to user ' + recipient);

    // build request & send
    request({
        url: 'https://graph.facebook.com/' + config.facebook.api + '/me/messages',
        qs: {access_token:config.facebook.pageToken},
        method: 'POST',
        json: {
          recipient: {id:recipient},
          message: data.message,
        }
      }, function(error, response, body) {
        if (error) {
          logger.info('Error sending message: ', error);
        } else if (response.body.error) {
          logger.info('Error: ', response.body.error);
        }
    });
}

Messenger.prototype.sendResponse = sendResponse

/**
 * Replace any of the custom fields with user data.
 */
function replaceMergeFields(response, mergeFields) {

    if (response.template === 'button') {

        response.message.attachment.payload.text = response.message.attachment.payload.text.replace('{{firstName}}', mergeFields['firstName']);
        response.message.attachment.payload.text = response.message.attachment.payload.text.replace('{{photo-count}}', mergeFields['photoCount']);

        for (var i=0; i<response.message.attachment.payload.buttons.length; i++) {
            logger.info(i + ': ' + JSON.stringify(response.message.attachment.payload.buttons[i]));
            if (!!response.message.attachment.payload.buttons[i].url) {
                response.message.attachment.payload.buttons[i].url = response.message.attachment.payload.buttons[i].url.replace('{{messengerId}}', mergeFields['messengerId']);
                response.message.attachment.payload.buttons[i].url = response.message.attachment.payload.buttons[i].url.replace('{{userId}}', mergeFields['userId']);
            }
        }
    } else {
        response.message.text = response.message.text.replace('{{firstName}}', mergeFields['firstName']);
        response.message.text = response.message.text.replace('{{photo-count}}', mergeFields['photoCount']);
    }
    logger.info('RESPONSE: ' + JSON.stringify(response));
    return response;
}

/**
 * Get the merge field values to be used in the responses if available.
 */
function getMergeFields(user, envelope, imageset) {

    var mergeFields = [];

    // Set merge fields to merge into message and URLS in case required.
    mergeFields['messengerId'] = envelope.sender.id;
    mergeFields['userId'] = !!user ? user._id : '';
    mergeFields['firstName'] = !!user ? user.firstName : '';
    mergeFields['photoCount'] = !!imageset ? imageset.images.length : '';

    return mergeFields;
}

/**
 * Expose
 * @type {MessengerService}
 */
module.exports = exports = new Messenger();
