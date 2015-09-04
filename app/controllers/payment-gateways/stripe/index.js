/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */

var StripeController = function() {
    this.customer = require('./customer');
};

/**
 * Expose
 * @type {StripeController}
 */
module.exports = exports = new StripeController();
