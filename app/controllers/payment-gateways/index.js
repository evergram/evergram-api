/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */

function PaymentGateways() {
    this.stripe = require('./stripe');
}

module.exports = exports = new PaymentGateways();
