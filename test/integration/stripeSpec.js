var q = require('q');
var request = require('supertest');
var should = require('should');
var sinon = require('sinon');
var common = require('evergram-common');
var paymentManager = common.payments.manager;
var User = common.models.User;

describe('StripeApi', function() {
    var app = require('../../app');
    var agent = request.agent(app);

    it('should create a stripe customer using /v1/payment-gateways/stripe/customer', function(done) {
        //stub stripe api
        var paymentManagerStub = sinon.stub(paymentManager, 'createCustomer');
        paymentManagerStub.returns(q.fcall(function() {
            return {id: 'stripeCustId'};
        }));

        agent.post('/v1/payment-gateways/stripe/customer').
            send({
                "email": "josh.stuart@zoopcommerce.com",
                "source": "stripeToken",
                "plan": "TEST-123",
                "metadata": {
                    "instagram_id": "awdawda",
                    "first_name": "Josh",
                    "last_name": "Stuart",
                    "instagram_username": "joshystuart"
                }
            }).
            end(function(err, res) {
                should.not.exist(err);

                //assert the request was successful
                res.status.should.be.equal(201);

                res.body.id.should.be.equal('stripeCustId');
                done();
            });
    });

    afterEach(function(done) {
        User.remove({}, function() {
            done();
        });
    });
});
