/**
 * Module dependencies
 */

var common = require('evergram-common');
var userManager = common.user.manager;
var trackingManager = require('../../../tracking');

function SignedUpController() {

}

SignedUpController.prototype.create = function(req, res) {
    req.checkBody('data.relationships.user', 'The user relationship is required').notEmpty();
    req.checkBody('data.relationships.user.data.id', 'The user ID is required').notEmpty();
    req.checkBody('data.relationships.user.data.type', 'The user type is required').notEmpty();

    var id = req.body.data.relationships.user.data.id;
    userManager.findById(id).
        then(function(user) {
            if (!!user) {
                trackingManager.trackSignedUp(user).
                    then(function() {
                        res.status(201).send();
                    }).
                    fail(function(err) {
                        res.status(400).send(err.message);
                    });
            } else {
                res.status(400).send('User does not exist');
            }
        }).
        fail(function(err) {
            res.status(400).send(err.message);
        });
};

module.exports = exports = new SignedUpController();
