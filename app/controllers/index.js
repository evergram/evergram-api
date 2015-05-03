/**
 * Module dependencies
 */

function Controllers() {
    this.authentication = require('./authentication');
    this.users = require('./users');
}

module.exports = exports = new Controllers();
