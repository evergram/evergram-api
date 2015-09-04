/**
 * PaymentManager
 * @author Richard O'Brien <richard@stichmade.com>
 */

var q = require('q');
var config = require('../../../app/config').stripe;
var stripe = require('stripe');

/**
 * A manager which provides a simple api to interact with Stripe
 *
 * @constructor
 */
function PaymentManager() {
    this.stripe = stripe(config.secretAccessKey);
}

/**
 * Creates a customer in stripe.
 *
 * @param data is the customer data to be created with.
 * @returns {promise|*|q.promise}
 */
PaymentManager.prototype.createCustomer = function(data) {
    return q.ninvoke(this.stripe.customers, 'create', data);
};

/**
 * Updates an existing customer in stripe.
 *
 * @param id is the stripe customer id.
 * @param data is the customer data to be updated.
 * @returns {promise|*|q.promise}
 */
PaymentManager.prototype.updateCustomer = function(id, data) {
    return q.ninvoke(this.stripe.customers, 'update', id, data);
};

/**
 * Expose
 * @type {UserManager}
 */
module.exports = exports = new PaymentManager();
