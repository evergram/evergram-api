/**
 * Module dependencies
 */

function Controllers() {
    return {
        users: require('./users')
    };
}

module.exports = exports = new Controllers();