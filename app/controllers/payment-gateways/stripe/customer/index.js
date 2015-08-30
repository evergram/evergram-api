/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */

var common = require('evergram-common');
var paymentManager = require('../../../../../lib/payments').manager;
var logger = common.utils.logger;

var CustomerController = function() {
};

/**
 * Creates a stripe customer.
 *
 * @param req
 * @param res
 */
CustomerController.prototype.create = function(req, res) {
    paymentManager.createCustomer(req.body).
        then(function(createdCustomerData) {
            logger.info('Created Stripe customer');

            res.status(201).json(createdCustomerData);
        }).
        fail(function(err) {
            logger.error('Failed to create Stripe customer', err);

            res.status(400).send(err);
        });
};

/**
 * Updates a stripe customer.
 *
 * @param req
 * @param res
 */
CustomerController.prototype.update = function(req, res) {
    paymentManager.updateCustomer(req.params.id, req.body).
        then(function(updatedCustomerData) {
            logger.info('Updated Stripe customer');

            res.status(200).json(updatedCustomerData);
        }).
        fail(function(err) {
            logger.error('Failed to update Stripe customer', err);

            res.status(400).send(err);
        });
};

/**
 * Expose
 * @type {CustomerController}
 */
module.exports = exports = new CustomerController();
