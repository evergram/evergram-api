/**
 * Module dependencies
 */

function Controllers() {
    this.authentication = require('./authentication');
    this.events = require('./events');
    this.paymentGateways = require('./payment-gateways');
    this.users = require('./users');
    this.imageSets = require('./image-sets');
}

module.exports = exports = new Controllers();
