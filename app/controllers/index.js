/**
 * Module dependencies
 */

function Controllers() {
    this.authentication = require('./authentication');
    this.paymentGateways = require('./paymentGateways');
    this.users = require('./users');
}

module.exports = exports = new Controllers();
