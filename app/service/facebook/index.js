/**
 * @author Richard O'Brien <richard@stichmade.com>
 */

/**
 * A service to manage all facebook related tasks. This is not a standalone NodeJS app, but rather is designed to
 * integrate into evergram-api
 * @constructor
 */
function FacebookService() {
    this.messenger = require('./messenger')
    //this.posts = require('./posts')
    this.imagesets = require('./imagesets')
}

/**
 * Expose
 * @type {Common}
 */
module.exports = exports = new FacebookService();
