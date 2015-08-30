/**
 * @author Richard O'Brien <richard@stichmade.com>
 */

/**
 * A payment service that contains a manager
 *
 * @constructor
 */
function PaymentService() {
    this.manager = require('./manager');
}

/**
 * Expose
 * @type {PaymentService}
 */
module.exports = exports = new PaymentService();
