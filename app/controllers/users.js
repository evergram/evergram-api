/**
 * @author Richard O'Brien <richard@stichmade.com>
 */

var common = require('evergram-common');
var trackingManager = require('../tracking');
var userManager = common.user.manager;
var paymentManager = common.payments.manager;
var logger = common.utils.logger;

/**
 * Module dependencies.
 */

var UserController = function() {
    //constructor does nothing
};

/**
 * Gets all users.
 *
 * @param req
 * @param res
 */
UserController.prototype.getList = function(req, res) {
    res.status(204).send();
};

/**
 *
 * @param req
 * @param res
 */
UserController.prototype.get = function(req, res) {
    validateUserId(req, res);
    res.status(204).send();
};

/**
 *
 * @param req
 * @param res
 */
UserController.prototype.create = function(req, res) {
    res.status(204).send();
};

/**
 * @deprecated
 *
 * This is now deprecated since it not only updates the user but it creates a user in stripe.
 * We should only update a user.
 */
UserController.prototype.updateLegacy = function(req, res) {
    validateUserId(req, res);
    validateUserDetails(req, res);
    validateStripeToken(req, res);

    // check if user exists
    getUser(req.params.id).
        then(function(user) {
            return updateUser(user, req.body);
        }).
        then(function(user) {
            //TODO Having this here isn't RESTful
            return createPaymentCustomer(user, req.body.stripeToken);
        }).
        then(function() {
            res.status(204).send();
        }).
        fail(function(err) {
            res.status(400).send(err);
        });
};

/**
 *
 * @param req
 * @param res
 */
UserController.prototype.createPayment = function(req, res) {
    validateUserId(req, res);
    validateStripeToken(req, res);

    // check if user exists
    getUser(req.params.id).
        then(function(user) {
            return createPaymentCustomer(user, req.body.stripeToken);
        }).
        then(function() {
            res.status(204).send();
        }).
        fail(function(err) {
            res.status(400).send(err);
        });
};

/**
 *
 * @param userId
 * @param req
 * @param res
 */
function validateUserId(req, res) {
    if (!req.params.id) {
        logger.error('Database User _id not present. ');
        res.status(400).send('Database User _id not present.');
        return;
    }
}

/**
 *
 * @param req
 * @param res
 */
function validateStripeToken(req, res) {
    req.checkBody('stripeToken', 'A Stripe token is required').notEmpty();

    // check the validation object for errors
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).send(errors);
        return;
    }
}

/**
 *
 * @param req
 * @param res
 */
function validateUserDetails(req, res) {
    // verify we have good data in request
    // validate the input
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
}

/**
 * @deprecated
 *
 * This not only creates a customer in Stripe, but also triggers a "tracked" sign up call.
 * We should refactor the sign up process into a much more RESTful one.
 *
 * @param user
 * @param stripeToken
 * @returns {*|Progress|promise|*|q.promise}
 */
function createPaymentCustomer(user, stripeToken) {
    // create billing record
    return paymentManager.createCustomer(user, stripeToken)
        .then(function(stripeResponse) {
            logger.info('Customer successfully added to Stripe (' + stripeResponse.id + ', ' + user.billing.option +
            ')');

            user.billing.stripeId = stripeResponse.id;
            user.signupComplete = true;

            // update user record with StripeID
            return userManager.update(user);
        }).
        then(function() {
            trackingManager.trackSignedUp(user);
            logger.info('Customer ' + user.id + ' signup complete.');
        }).
        fail(function(err) {
            logger.error('Create Stripe customer: ' + err);

            //form into same structure as express-validator
            return {
                param: err.param,
                msg: err.message,
                value: ''
            };
        });
}

/**
 *
 * @param user
 * @param data
 * @returns {*|Progress|promise|*|q.promise}
 */
function updateUser(user, data) {
    logger.info('Customer ' + user.id + ' found');

    user.firstName = data.fname;
    user.lastName = data.lname;
    user.email = data.email;
    user.address.line1 = data.address;
    user.address.suburb = data.city;
    user.address.state = data.state;
    user.address.postcode = data.postcode;
    user.address.country = data.country;
    user.billing.option = data.plan;

    return userManager.update(user);
}

/**
 *
 * @param userId
 * @returns {*|Progress|promise|*|q.promise}
 */
function getUser(userId) {
    logger.info('Start step 2: _id = ' + userId);

    return userManager.find({criteria: {_id: userId}}).
        then(function(user) {
            logger.info('Customer ' + user.id + ' address and account details updated.');
            return user;
        }).
        fail(function(err) {
            logger.error('Saving account details: ' + err);
            return err;
        });
}

/**
 * Expose
 * @type {UserController}
 */
module.exports = exports = new UserController();
