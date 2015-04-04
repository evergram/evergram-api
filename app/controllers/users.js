
/**
 * @author Richard O'Brien <richard@stichmade.com>
 */

var Q = require('q');
var common = require('evergram-common');
var userManager = common.user.manager;
var paymentManager = common.payments.manager;

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
UserController.prototype.saveAuthentication = function(user, info, req, res) {

	res.send("Saved Auth data");
}


/**
 *	Validate data and create a user using evergram-common.userManager & save card details using evergram-common.paymentManager
 */
UserController.prototype.createAccount = function(req, res) {

	res.send("Created account");
/*
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 	//var deferred = Q.defer();

 	// verify we have good data in request
	//if (!!req.Body && !!req.Body.id) {
    //	var id = req.Body.id;

 	// verify if user exists???
 	var userData = JSON.parse(req.Body);
 	
 	// create user
 	var user = userManager.create(data);

 	// create billing record
 	paymentManager.createCustomer(req.body.stripeToken, user)
 	.then(function(stripeResponse){
 		userManage.update(user.id, { "billing.stripeID" : stripeResponse.id });		// update user record with StripeID
 	}).then( function(success) {
 		res.status(200).send("Customer successfully created.");
 	}).fail( function(err) {
 		res.status(400).send(err);
 	})

    //return deferred.promise;
*/
}


/**
 * Expose
 * @type {UserController}
 */
module.exports = exports = new UserController;