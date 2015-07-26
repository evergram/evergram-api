/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */

var common = require('evergram-common');
var paymentManager = common.payments.manager;
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
        then(function(createdStripeUser) {
            logger.info('Created Stripe customer');

            res.status(201).json(createdStripeUser);
        }).
        fail(function(err) {
            logger.error('Failed creating Stripe customer', err);

            res.status(400).send(err);
        });
};

/**
 * Expose
 * @type {CustomerController}
 */
module.exports = exports = new CustomerController();
