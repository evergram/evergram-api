/**
 * @author Richard O'Brien <richard@stichmade.com>
 */

var _ = require('lodash');
var q = require('q');
var common = require('evergram-common');
var logger = common.utils.logger;
var userManager = common.user.manager;
var User = common.models.User;
var facebookService = require('../service/facebook');

/**
 * Module dependencies.
 */

var FacebookController = function() {
    //constructor does nothing
};

/**
 * Used as a 1-time thing by Facebook to confirm the webhook's identify.
 * @returns hub.challenge sent by facebook
 */
FacebookController.prototype.verify = function(req, res) {
	logger.info("Facebook Verify: " + JSON.stringify(req.query));
	if (req.query['hub.verify_token'] === common.config.facebook.verifyToken) {
		res.send(req.query['hub.challenge']);
	} else {
        logger.error('Error, wrong validation token');
		res.status(400).send('Error, wrong validation token');    
	}
}

/**
 * Post message received from Facebook Messenger.
 *
 * @param req
 * @param res
 */
FacebookController.prototype.messageReceived = function(req, res) {
	var deferred = q.defer();
	var deferredEvents = []

    logger.info('FB Messenger: Message received (id:' + req.body.entry[0].id + ') ' + JSON.stringify(req.body));
    
    // TODO: verify the sha1= token from header?

    // TODO: do we need to verify if this is a Page object? { object: 'page' }

    var messaging_events = req.body.entry[0].messaging;

    // for each message in the request
    _.forEach(messaging_events, function(messageEvent) {
    	var eventDefer = q.defer();
    	deferredEvents.push(eventDefer);

	    if(!!messageEvent.message) {
	    	// only process messages, ignore other types (e.g. delivery receipts)
		    facebookService.messenger.processMessage(messageEvent).
		    then(function(response) {
		        logger.info('FB Messenger: Message processed for sender.id ' + messageEvent.sender.id);
		        eventDefer.resolve();
		    }).
		    fail(function(err) {
		        logger.error('FB Messenger: Error processing message for sender.id ' + messageEvent.sender.id, err);
		        eventDefer.reject();
		    });
		} else if (messageEvent.optin) {
			// Authentication event
			eventDefer.resolve();
        } else if (messageEvent.delivery) {
        	// Delivery receipt so ignore it for now
			eventDefer.resolve();
        } else if (messageEvent.postback) {
        	// postback so process user's selection
          	facebookService.messenger.processPostback(messageEvent).
		    then(function(response) {
		        logger.info('FB Messenger: Postback processed for sender.id ' + messageEvent.sender.id);
				eventDefer.resolve();
		    }).
		    fail(function(err) {
		        logger.error('FB Messenger: Error processing postback for sender.id ' + messageEvent.sender.id, err);
		        eventDefer.reject();
		    });
        } else {
        	logger.info("Webhook received unknown postbackEvent: ", messageEvent);
		    eventDefer.reject();
        }
	})

	q.all(deferredEvents).then(function(){
		res.status(200).send('OK');
	});
};

/**
 * Post received from Facebook.
 *
 * @param req
 * @param res
 */
FacebookController.prototype.postReceived = function(req, res) {
    logger.info('FB Posts: Post received (type:' + req.body.object + ', uid:' + req.body.entry[0].uid + ', id:' + req.body.entry[0].id + ') ' + JSON.stringify(req.body));
    
    // TODO: verify the sha1= token from header?
/*
    var post_entries = req.body.entry;

    // for each message in the request
    _.forEach(post_entries, function(postEntry) {
	    if(!!postEntry) {
	    	// only process messages, ignore other types (e.g. delivery receipts)
		    facebookService.posts.process(postEntry).
		    then(function(response) {
		        logger.info('FB Posts: Post processed for userid ' + postEntry.uid);
		    }).
		    fail(function(err) {
		        logger.error('FB Posts: Error processing post for userid ' + postEntry.uid, err);
		    });
		} else {
			// what to do?
		}
	})*/
	res.status(200).send('OK');
};



/**
 * Expose
 * @type {UserController}
 */
module.exports = exports = new FacebookController();
