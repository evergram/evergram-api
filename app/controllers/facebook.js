/**
 * @author Richard O'Brien <richard@stichmade.com>
 */

var _ = require('lodash');
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
    logger.info('FB Messenger: Message received (id:' + req.body.entry[0].id + ') ' + JSON.stringify(req.body));
    
    // TODO: verify the sha1= token from header?

    // TODO: do we need to verify if this is a Page object? { object: 'page' }

    var messaging_events = req.body.entry[0].messaging;

    // for each message in the request
    _.forEach(messaging_events, function(messageEvent) {
	    if(!!messageEvent.message) {
	    	// only process messages, ignore other types (e.g. delivery receipts)
		    facebookService.messenger.process(messageEvent).
		    then(function(response) {
		        logger.info('FB Messenger: Message processed for sender.id ' + messageEvent.sender.id);
		    }).
		    fail(function(err) {
		        logger.error('FB Messenger: Error processing message for sender.id ' + messageEvent.sender.id, err);
		    });
		} else {
			// must be a delivery reciept, so ignore it
		}
	})
	res.status(200).send('OK');
};


/**
 * Expose
 * @type {UserController}
 */
module.exports = exports = new FacebookController();
