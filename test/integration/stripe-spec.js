// jscs:disable
var q = require('q');
var request = require('supertest');
var should = require('should');
var sinon = require('sinon');
var common = require('evergram-common');
var paymentManager = require('../../lib/payments').manager;

describe('Stripe Api', function() {
    var app = require('../../app');
    var agent = request.agent(app);
    var paymentManagerCreateStub = sinon.stub(paymentManager, 'createCustomer');
    var paymentManagerUpdateStub = sinon.stub(paymentManager, 'updateCustomer');

    it('should create a stripe customer using /v1/payment-gateways/stripe/customer', function(done) {
        //stub stripe api
        var id = 'stripeCustId';
        var data = {
            email: 'josh.stuart@zoopcommerce.com',
            source: 'stripeToken',
            plan: 'TEST-123',
            metadata: {
                instagram_id: 'awdawda',
                first_name: 'Josh',
                last_name: 'Stuart',
                instagram_username: 'joshystuart'
            }
        };

        paymentManagerCreateStub.returns(q.fcall(function() {
            return {id: id};
        }));

        agent.post('/v1/payment-gateways/stripe/customer').
            send(data).
            end(function(err, res) {
                should.not.exist(err);

                //assert the request was successful
                res.status.should.be.equal(201);

                res.body.id.should.be.equal(id);
                done();
            });
    });

    it('should fail to create a stripe customer using /v1/payment-gateways/stripe/customer when an error is thrown',
        function(done) {
            //stub stripe api
            var data = {
                email: 'josh.stuart@zoopcommerce.com',
                source: 'stripeToken',
                plan: 'TEST-123',
                metadata: {
                    instagram_id: 'awdawda',
                    first_name: 'Josh',
                    last_name: 'Stuart',
                    instagram_username: 'joshystuart'
                }
            };

            paymentManagerCreateStub.returns(q.fcall(function() {
                throw new Error();
            }));

            agent.post('/v1/payment-gateways/stripe/customer').
                send(data).
                end(function(err, res) {
                    should.not.exist(err);

                    //assert the request was not successful
                    res.status.should.be.equal(400);
                    done();
                });
        });

    it('should update a stripe customer using /v1/payment-gateways/stripe/customer/:id', function(done) {
        //stub stripe api
        var id = 'stripeCustId';
        var data = {
            email: 'josh.stuart@zoopcommerce.com',
            plan: 'NEW-TEST-123',
            metadata: {
                instagram_id: 'awdawda'
            }
        };

        paymentManagerUpdateStub.withArgs(id, data).returns(q.fcall(function() {
            return {id: id};
        }));

        agent.patch('/v1/payment-gateways/stripe/customer/' + id).
            send(data).
            end(function(err, res) {
                should.not.exist(err);

                //assert the request was successful
                res.status.should.be.equal(200);
                res.body.id.should.be.equal(id);
                done();
            });
    });

    it('should fail to update a stripe customer using /v1/payment-gateways/stripe/customer/:id when an error is thrown',
        function(done) {
            //stub stripe api
            var id = 'stripeCustId';
            var data = {
                'plan': 'MISSING-PLAN'
            };

            paymentManagerUpdateStub.withArgs(id, data).returns(q.fcall(function() {
                throw new Error();
            }));

            agent.patch('/v1/payment-gateways/stripe/customer/' + id).
                send(data).
                end(function(err, res) {
                    should.not.exist(err);

                    //assert the request was not successful
                    res.status.should.be.equal(400);
                    done();
                });
        });

    afterEach(function(done) {
        paymentManagerCreateStub.reset();
        paymentManagerUpdateStub.reset();
        done();
    });
});
