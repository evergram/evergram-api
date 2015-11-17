/**
 * @author Richard O'Brien <richard@stichmade.com>
 * @author Josh Stuart <joshstuartx@gmail.com>
 */

var _ = require('lodash');
var common = require('evergram-common');
var logger = common.utils.logger;
var userManager = common.user.manager;
var User = common.models.User;

/**
 * Module dependencies.
 */

var UserController = function() {
    //constructor does nothing
};

/**
 * Serializes user models for a response.
 *
 * @param users
 * @returns {User}
 */
function serialize(user) {
    var serializedUser = user;
    delete serializedUser.jobs;
    delete serializedUser.payments;

    return serializedUser;
}

/**
 * Gets all users.
 *
 * @param req
 * @param res
 */
UserController.prototype.getList = function(req, res) {
    logger.info('Getting users');
    userManager.findAll({lean: true}).
    then(function(users) {
        logger.info('Found ' + users.length + ' users');
        var serializedUsers = [];
        _.forEach(users, function(user) {
            serializedUsers.push(serialize(user));
        });
        res.json(serializedUsers);
    }).
    fail(function(err) {
        logger.error('Error getting users', err);
        res.status(400).send(err.message);
    });
};

/**
 * Gets a single user.
 *
 * @param req
 * @param res
 */
UserController.prototype.get = function(req, res) {
    logger.info('Getting user ' + req.params.id);
    userManager.findById(req.params.id, {lean: true}).
    then(function(user) {
        if (!!user) {
            logger.info('Found user ' + user.id);
            res.json(serialize(user));
        } else {
            logger.error('Error: user ' + req.params.id + ' not found');
            res.status(404).send('User does not exist');
        }
    }).
    fail(function(err) {
        res.status(400).send(err.message);
    });
};

/**
 * Creates a user.
 *
 * @param req
 * @param res
 */
UserController.prototype.create = function(req, res) {
    logger.info('Creating user');
    removeProtectedFields(req.body);
    var user = new User(req.body);

    userManager.create(user).
    then(function(createdUser) {
        logger.info('Created user ' + createdUser.id);
        res.status(201).json(createdUser.toObject());
    }).
    fail(function(err) {
        logger.error('Error creating user', err);
        res.status(400).send(err.message);
    });
};

/**
 * Updates a user.
 *
 * @param req
 * @param res
 */
UserController.prototype.update = function(req, res) {
    logger.info('Updating user ' + req.params.id);

    removeProtectedFields(req.body);

    // if signupComplete=true, but the user is missing details, dont set signupComplete=true.
    if (!isComplete(req.body) && !!req.body.signupComplete) {
        req.body.signupComplete = false;
    }

    userManager.findAndUpdate(req.params.id, req.body).
    then(function(updatedUser) {
        logger.info('Updated user ' + req.params.id);
        res.status(201).json(updatedUser.toObject());
    }).
    fail(function(err) {
        logger.error('Error updating user ' + req.params.id, err);
        res.status(400).send(err.message);
    });
};

function removeProtectedFields(user) {
    delete user.signupCompletedOn;
    delete user.updatedOn;
    delete user.createdOn;
    delete user.active;
    delete user._id;
    delete user.__v;
}

function isComplete(user) {
    return !!user.address && !!user.billing && !_.isEmpty(user.address.country) && !_.isEmpty(user.address.line1) &&
        !_.isEmpty(user.address.postcode) && !_.isEmpty(user.address.state) && !_.isEmpty(user.address.suburb) &&
        !_.isEmpty(user.billing.option) && !_.isEmpty(user.email) && !_.isEmpty(user.firstName) &&
        !_.isEmpty(user.lastName);
}

/**
 * Expose
 * @type {UserController}
 */
module.exports = exports = new UserController();
