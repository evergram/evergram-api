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
 * Expose
 * @type {UserController}
 */
module.exports = exports = new UserController();
