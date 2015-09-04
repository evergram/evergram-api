/**
 * Expose
 */

module.exports = {
    api: {
        version: process.env.API_VERSION || '/v1'
    },
    stripe: {
        secretAccessKey: process.env.STRIPE_SECRET_ACCESS_KEY
    }
};
