/**
 * @author Richard O'Brien <richard@stichmade.com>
 * @author Josh Stuart <joshstuartx@gmail.com>
 */

var common = require('evergram-common');
var userManager = common.user.manager;
var User = common.models.User;

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
    userManager.findAll({lean: true}).
        then(function(users) {
            res.json(users);
        }).
        fail(function(err) {
            res.status(400).
                json(err);
        });
};

/**
 * Gets a single user.
 *
 * @param req
 * @param res
 */
UserController.prototype.get = function(req, res) {
    userManager.findById(req.params.id, {lean: true}).
        then(function(user) {
            if (!!user) {
                res.json(user);
            } else {
                res.status(404).send();
            }
        }).
        fail(function(err) {
            res.status(400).
                json(err);
        });
};

/**
 * Creates a user.
 *
 * @param req
 * @param res
 */
UserController.prototype.create = function(req, res) {
    var user = new User(req.body);

    userManager.create(user).
        then(function(createdUser) {
            res.status(201).
                json(createdUser.toObject());
        }).
        fail(function(err) {
            res.status(400).
                json(err);
        });
};

/**
 * Updates a user.
 *
 * @param req
 * @param res
 */
UserController.prototype.update = function(req, res) {
    userManager.findAndUpdate(req.params.id, req.body).
        then(function(updatedUser) {
            res.status(201).
                json(updatedUser.toObject());
        }).
        fail(function(err) {
            res.status(400).
                json(err);
        });
};

/**
 *
 * @param userId
 * @param req
 * @param res
 */
function getUserIdErrors(req) {
    if (!req.params.id) {
        return 'Database User _id not present.';
    }
}

/**
 *
 * @param req
 * @param res
 */
function getStripeTokenErrors(req) {
    req.checkBody('stripeToken', 'A Stripe token is required').notEmpty();

    // check the validation object for errors
    return req.validationErrors();
}

/**
 *
 * @param req
 * @param res
 */
function getUserDetailsErrors(req) {
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
    return req.validationErrors();
}

/**
 * Expose
 * @type {UserController}
 */
module.exports = exports = new UserController();
