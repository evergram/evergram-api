var q = require('q');
var request = require('supertest');
var sinon = require('sinon');
var should = require('should');
var common = require('evergram-common');
var trackingManager = require('../../app/tracking');
var userManager = common.user.manager;
var paymentManager = common.payments.manager;
var User = common.models.User;

describe('UserApi', function() {
    var app = require('../../app');
    var agent = request.agent(app);

    it('should create a user using /user', function(done) {
        //create user
        agent.post('/user').
            send({
                firstName: 'Elon',
                lastName: 'Musk',
                instagram: {
                    username: 'elonmusk'
                }
            }).
            end(function(err, res) {
                should.not.exist(err);
                res.status.should.be.equal(204);
                done();
            });
    });

    it('should update a user using /user/:id', function(done) {
        var newUser = new User({
            instagram: {
                username: 'elonmusk'
            }
        });

        //stub payment manager to return a valid customer
        var paymentManagerStub = sinon.stub(paymentManager, 'createCustomer');
        paymentManagerStub.returns(q.fcall(function() {
            return {id: 'stripeCustId'};
        }));

        //mock tracking manager and assert that it is called once
        sinon.mock(trackingManager).
            expects('trackSignedUp').
            once();

        //create user
        userManager.create(newUser).
            then(function(user) {

                agent.put('/user/' + user._id).
                    send({
                        plan: 'PAYG',
                        fname: 'Elon',
                        lname: 'Musk',
                        email: 'elon@teslamotors.com',
                        address: '45500 Fremont Blvd',
                        city: 'Fremont',
                        state: 'CA',
                        postcode: '94538',
                        country: 'US',
                        instagram: {
                            username: 'elonmusk'
                        },
                        stripeToken: 'testToken'
                    }).
                    end(function(err, res) {
                        should.not.exist(err);

                        //assert the request was succ
                        res.status.should.be.equal(204);

                        userManager.find({criteria: {_id: user._id}}).
                            then(function(savedUser) {
                                //verify that the user details were saved correctly

                                savedUser.firstName.should.be.equal('Elon');
                                savedUser.lastName.should.be.equal('Musk');
                                savedUser.address.line1.should.be.equal('45500 Fremont Blvd');
                                savedUser.address.suburb.should.be.equal('Fremont');
                                savedUser.address.state.should.be.equal('CA');
                                savedUser.address.postcode.should.be.equal('94538');
                                savedUser.address.country.should.be.equal('US');
                                savedUser.billing.option.should.be.equal('PAYG');
                                savedUser.billing.stripeId.should.be.equal('stripeCustId');
                                savedUser.signupComplete.should.be.equal(true);
                                savedUser.active.should.be.equal(true);

                                done();
                            }).
                            fail(function(err) {
                                done(err);
                            });
                    });
            }).
            fail(function(err) {
                done(err);
            });
    });

    afterEach(function(done) {
        User.remove({}, function() {
            done();
        });
    });
});
