/**
 * @author Richard O'Brien <richard@stichmade.com>
 */

var common = require('evergram-common');
var trackingManager = require('../tracking');
var userMapper = common.mapper;
var userManager = common.user.manager;
var paymentManager = common.payments.manager;
var logger = common.utils.logger;

/**
 * Module dependencies.
 */

var UserController = function() {
    //constructor does nothing
};

UserController.prototype.login = function(req, res) {
    res.status(200).send('sign in 1');
};

/**
 *    Validate data and create a user using evergram-common.userManager & save card details using
 * evergram-common.paymentManager
 *
 *    NOT CURRENTLY USED.
 */
UserController.prototype.saveAuth = function(req, res) {

};

/**
 * Gets all users.
 *
 * @param req
 * @param res
 */
UserController.prototype.getList = function(req, res) {

};

/**
 *    Validate data and create a user using evergram-common.userManager & save card details using
 * evergram-common.paymentManager
 */
UserController.prototype.saveAccountDetails = function(userId, req, res) {
    //TODO move this to express middleware. We should allow x-domain on our api
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    if (!userId) {
        logger.error('Database User _id not present. ');
        res.status(400).send('Database User _id not present.');
        return;
    }

    // verify we have good data in request
    // validate the input
    req.checkBody('stripeToken', 'A Stripe token is required').notEmpty();
    req.checkBody('plan', 'Plan ID is required').notEmpty();
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

    if (errors) {
        res.status(400).send(errors);
        return;
    }

    // check if user exists
    userManager.find({criteria: {_id: userId}}).then(function(user) {
        logger.info('Start step 2: _id = ' + userId);
        if (user) {
            logger.info('Customer ' + user.id + ' found');

            user.firstName = req.body.fname;
            user.lastName = req.body.lname;
            user.email = req.body.email;
            user.address.line1 = req.body.address;
            user.address.suburb = req.body.city;
            user.address.state = req.body.state;
            user.address.postcode = req.body.postcode;
            user.address.country = req.body.country;
            user.billing.option = req.body.plan;

            //TODO Flatten out this structure and turn these into testable blocks of code.
            // update user's address details
            userManager.update(user)
                .then(function() {
                    logger.info('Customer ' + user.id + ' address and account details updated.');

                    // create billing record
                    paymentManager.createCustomer(user, req.body.stripeToken)
                        .then(function(stripeResponse) {

                            logger.info('Customer successfully added to Stripe (' + stripeResponse.id + ', ' +
                            user.billing.option + ')');

                            user.billing.stripeId = stripeResponse.id;
                            user.signupComplete = true;

                            // update user record with StripeID
                            userManager.update(user).
                                then(function() {
                                    trackingManager.trackSignedUp(user);
                                    logger.info('Customer ' + user.id + ' signup complete.');
                                    res.status(204).send();
                                });
                        }).fail(function(err) {
                            logger.error('Create Stripe customer: ' + err);

                            //form into same structure as express-validator
                            var stripeError = [{
                                param: err.param,
                                msg: err.message,
                                value: ''
                            }];
                            res.status(400).send(stripeError);
                        });
                }).fail(function(err) {
                    logger.error('Saving account details: ' + err);
                    res.status(400).send(err);
                });
        } else {
            //something has gone wrong and the user hasn't saved from auth step. Redirect to error page.
            logger.error('User ' + user.id + ' not found. Account information couldn\'t be updated.');
            res.redirect(common.config.instagram.redirect.fail);
        }

    }).fail(function(err) {
        res.status(400).send(err);
    });
};

/**
 * Expose
 * @type {UserController}
 */
module.exports = exports = new UserController;