
/**
 * @author Richard O'Brien <richard@stichmade.com>
 */

var Q = require('q');
var common = require('evergram-common');
var userMapper = common.mapper;
var userManager = common.user.manager;
var paymentManager = common.payments.manager;
var logger = common.utils.logger;

/**
 * Module dependencies.
 */

 var UserController = function() {
 	//constructor does nothing
 }

UserController.prototype.login = function (req, res) {
    res.status(200).send('sign in 1');
};


/**
 *	Validate data and create a user using evergram-common.userManager & save card details using evergram-common.paymentManager
 *
 * 	NOT CURRENTLY USED.
 */
UserController.prototype.saveAuth = function(req, res) {

}


/**
 *	Validate data and create a user using evergram-common.userManager & save card details using evergram-common.paymentManager
 */
UserController.prototype.saveAccountDetails = function(userid, req, res) {

	/*
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 	*/

 	// verify we have good data in request
	// validate the input
	req.checkBody('stripeToken', 'A Stripe token is required').notEmpty();
	req.checkBody('plan', 'Plan ID is required').notEmpty();
	//req.checkBody('instagram_id', 'Instagram username is required').notEmpty();
	//req.checkBody('instagram_accesstoken', 'Instagram access-token is required').notEmpty();
	req.checkBody('fname', 'First name is required').notEmpty();
	req.checkBody('lname', 'Last name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Invalid email address').isEmail();
	req.checkBody('address', 'Street address is required').notEmpty();
	req.checkBody('city', 'City or suburb is required').notEmpty();
	req.checkBody('state', 'State is required').notEmpty();
	req.checkBody('postcode', 'Postcode is required').notEmpty();
	req.checkBody('country', 'Country is required').notEmpty();


	// check the validation object for errors
	var errors = req.validationErrors();

	if( errors ) {
		res.status(400).send(errors);
		return;
	}

	// check if user exists
	userManager.findUser({ "id" : userid }).then(function (user) {
        console.log("** USER SIGNUP **: Start");
        if (user) {
        	console.log("** USER SIGNUP **: Customer " + user.id + " found");

        	user.firstName = req.body.fname;
    		user.lastName = req.body.lname;
    		user.email = req.body.email;
    		user.address.line1 = req.body.address;
	    	user.address.suburb = req.body.city;
	    	user.address.state = req.body.state;
	    	user.address.postcode = req.body.postcode;
	    	user.address.country = req.body.country;
	    	user.billing.options = req.body.plan;
    		

        	// update user's address details
        	userManager.update(user)
        	.then( function(success) {
	 		
	 			console.log("** USER SIGNUP **: Customer " + user.id + " address and account details updated.");
	 			logger.info("** USER SIGNUP **: Customer " + user.id + " address and account details updated.");

	 			// create billing record
			 	paymentManager.createCustomer(req.body.stripeToken, user)
			 	.then(function(stripeResponse) {

			 		console.log("** USER SIGNUP **: Customer " + user.id + " added to Stripe (" + stripeResponse.id + ").");
			 		logger.info("** USER SIGNUP **: Customer " + user.id + " added to Stripe (" + stripeResponse.id + ").");

			 		user.billing.stripeID = stripeResponse.id;
			 		user.active = true;

					// update user record with StripeID
			 		userManager.update(user)
			 		.then(function(success) {
			 			logger.info("** USER SIGNUP **: Customer " + user.id + " successfully updated.");
			 			res.status(200).send("Customer " + user.id + " successfully updated.");
			 		});
			 	}).fail( function(err) {
			 		logger.error("** USER SIGNUP **: ERROR: " + err);
			 		res.status(400).send(err);
 				});
			}).fail( function(err) {
		 		console.log("** USER SIGNUP **: ERROR: " + err);
		 		logger.error("** USER SIGNUP **: ERROR: " + err);
		 		res.status(400).send(err);
 			});
		} else {
			//something has gone wrong and the user hasn't saved from auth step. Redirect to error page.
			logger.error("** USER SIGNUP **: ERROR: User " + user.id + " not found. Account information couldn't be updated.");
			res.redirect( common.config.instagram.redirect.fail );
		}

 	}).fail( function(err) {
 		res.status(400).send(err);
	});

	// create user
	//res.status(200).send("Customer successfully created.");
}


/**
 * Expose
 * @type {UserController}
 */
module.exports = exports = new UserController;