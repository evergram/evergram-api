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

    // Check this is a Pixy user (mid === facebook.messengerId)
    userManager.find({ criteria: { 'facebook.messengerId': ''+envelope.sender.id+'' }}).
    then(function(user) {
        if(!user) {
            logger.info("FB Messenger: User not found");
            // Not a pixy user, respond with a message prompting to signup or connet their account?
            var response = config.facebook.messengerResponses.ERROR.USER_NOT_FOUND || config.facebook.messengerResponses.ERROR.DEFAULT;
            sendResponse(envelope.sender.id, response);
            return deferred.resolve();
        }

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

            processPhotoMessage(envelope, user).
            then(function(response) {
                sendResponse(envelope.sender.id, response);
                return deferred.resolve();
            });
        }
        else if(!!envelope.message.text) {   // text - will really only process if user types MENU, HELP, or a question to send to help@printwithpixy.com
            logger.info("FB Messenger: Type is text");
            processTextMessage(envelope, user).
            then(function(response) {

                // inject messengerId if required
                if (response.template === 'button') {
                    _.forEach(response.message.attachment.payload.buttons, function(button) {
                        button.url.replace('{{messengerId}}', envelope.sender.id);
                    })
                }
                sendResponse(envelope.sender.id, response);
                return deferred.resolve();
            });
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

    logger.info("FB Messenger: processPostback payload = " + envelope.message.payload);

    // Check this is a Pixy user (mid === facebook.messengerId)
    userManager.find({ criteria: { 'facebook.messengerId': ''+envelope.sender.id+'' }}).
    then(function(user) {
        /* Types are...
         * - MENU
         * - HELP
         * - PHOTO_UPLOAD.START
         * - HELP.REQUEST
         */
        if(!!envelope.message.payload) { // 
            var response;

            if (envelope.message.payload === 'MENU') {
                // check if logged-in
                if(!user) {
                    logger.info("FB Messenger: User not found");
                    // Not a pixy user, respond with logged out menu
                    response = config.facebook.messengerResponses.MENU.DEFAULT;
                } else {
                    response = config.facebook.messengerResponses.MENU.LOGGED_IN;
                }

            } else if (envelope.message.payload === 'HELP') {
                response = config.facebook.messengerResponses.HELP.DEFAULT;
            } else if (envelope.message.payload === 'HELP.REQUEST') {
                response = config.facebook.messengerResponses.HELP.REQUEST;
            } else if (envelope.message.payload === 'PHOTO_UPLOAD.START') {
                response = config.facebook.messengerResponses.PHOTO_UPLOAD.DEFAULT;
            }

            // inject any variables into URLs if required
            if (response.template === 'button') {
                _.forEach(response.message.attachment.payload.buttons, function(button) {
                    button.url.replace('{{messengerId}}', envelope.sender.id);
                    button.url.replace('{{userId}}', user._id);
                })
            }

            sendResponse(envelope.sender.id, response);
            return deferred.resolve();
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

    // for each image in attachments
    _.forEach(envelope.message.attachments, function(attachment) {

        logger.info("### attachment: " + JSON.stringify(attachment));

        // skip video & audio
        if(attachment.type === 'image') {
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
        // TODO: Check printableImageSet is what's returned here so we can get the photo count for response message.
        // TODO: Find a way to manage variable insertion into responses
        logger.info('FB Messenger: Images successfully saved for user ' + user.getUsername());

        //var response = config.facebook.messengerResponses.PHOTO_UPLOAD_COMPLETE[user.billing.option] || config.facebook.messengerResponses.PHOTO_UPLOAD_COMPLETE.DEFAULT;
        var response = config.facebook.messengerResponses.PHOTO_UPLOAD.COMPLETE;

        // inject any variables into URLs if required
        response.message.text = response.message.text.replace('{{photo-count}}',imageset.length);

        if (response.template === 'button') {
            _.forEach(response.message.attachment.payload.buttons, function(button) {
                button.url.replace('{{messengerId}}', envelope.sender.id);
                button.url.replace('{{userId}}', user._id);
            })
        }

        logger.info('response: ' + JSON.stringify(response));

        deferred.resolve(response);
    }).fail(function(err) {
        logger.err('FB Messenger: ' + err);
        deferred.reject(config.facebook.messengerResponses.ERROR.UPLOAD_FAILED);
    });

    return deferred.promise;
}

/**
 *  Processes a message (messaging object) if it contains image attachements
 */
function processTextMessage(envelope, user) {
    var deferred = q.defer();

    logger.info("FB Messenger: Processing text");

    //TODO: handle various types of message.


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
          console.log('Error sending message: ', error);
        } else if (response.body.error) {
          console.log('Error: ', response.body.error);
        }
    });
}

Messenger.prototype.sendResponse = sendResponse


/**
 * Expose
 * @type {MessengerService}
 */
module.exports = exports = new Messenger();
