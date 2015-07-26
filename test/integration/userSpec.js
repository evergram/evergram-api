var q = require('q');
var request = require('supertest');
var should = require('should');
var common = require('evergram-common');
var userManager = common.user.manager;
var User = common.models.User;

describe('UserApi', function() {
    var app = require('../../app');
    var agent = request.agent(app);

    it('should get all users /v1/users', function(done) {
        var newUser1 = new User({
            instagram: {
                username: 'elonmusk1'
            }
        });
        var newUser2 = new User({
            instagram: {
                username: 'elonmusk2'
            }
        });

        q.all([
            userManager.create(newUser1),
            userManager.create(newUser2)
        ]).
            then(function() {
                agent.get('/v1/users').
                    send().
                    end(function(err, res) {
                        should.not.exist(err);

                        //assert the request was successful
                        res.status.should.be.equal(200);

                        //verify body
                        res.body.should.be.instanceof(Array).and.have.lengthOf(2);
                        res.body[0].instagram.username.should.not.be.empty;
                        res.body[1].instagram.username.should.not.be.empty;

                        done();
                    });
            }).
            fail(function(err) {
                done(err);
            });
    });

    it('should get a single users /v1/users/:id', function(done) {
        var newUser = new User({
            instagram: {
                username: 'elonmusk'
            }
        });
        userManager.create(newUser).
            then(function(createdUser) {
                agent.get('/v1/users/' + createdUser._id).
                    send().
                    end(function(err, res) {
                        should.not.exist(err);

                        //assert the request was successful
                        res.status.should.be.equal(200);

                        //verify body
                        res.body.should.not.be.empty;
                        res.body.instagram.username.should.be.equal('elonmusk');

                        done();
                    });
            }).
            fail(function(err) {
                done(err);
            });
    });

    it('should create a user using /v1/users', function(done) {
        agent.post('/v1/users').
            send({
                firstName: 'Elon',
                lastName: 'Musk',
                email: 'elon@teslamotors.com',
                billing: {
                    option: 'PAYG'
                },
                address: {
                    line1: '45500 Fremont Blvd',
                    suburb: 'Fremont',
                    state: 'CA',
                    postcode: '94538',
                    country: 'US'
                },
                instagram: {
                    username: 'elonmusk'
                }
            }).
            end(function(err, res) {
                should.not.exist(err);

                //assert the request was successful
                res.status.should.be.equal(201);

                //verify that the user details were saved correctly in the db
                userManager.find({criteria: {_id: res.body._id}}).
                    then(function(user) {

                        user.firstName.should.be.equal('Elon');
                        user.lastName.should.be.equal('Musk');
                        user.address.line1.should.be.equal('45500 Fremont Blvd');
                        user.address.suburb.should.be.equal('Fremont');
                        user.address.state.should.be.equal('CA');
                        user.address.postcode.should.be.equal('94538');
                        user.address.country.should.be.equal('US');
                        user.billing.option.should.be.equal('PAYG');
                        user.instagram.username.should.be.equal('elonmusk');
                        user.signupComplete.should.be.equal(false);
                        user.active.should.be.equal(true);

                        done();
                    }).
                    fail(function(err) {
                        done(err);
                    });
            });
    });

    it('should update a user using /v1/users/:id', function(done) {
        var newUser = new User({
            instagram: {
                username: 'elonmusk'
            }
        });

        userManager.create(newUser).
            then(function(createdUser) {
                agent.patch('/v1/users/' + createdUser._id).
                    send({
                        firstName: 'Elon',
                        lastName: 'Musk',
                        email: 'elon@teslamotors.com',
                        billing: {
                            option: 'PAYG'
                        },
                        address: {
                            line1: '45500 Fremont Blvd',
                            suburb: 'Fremont',
                            state: 'CA',
                            postcode: '94538',
                            country: 'US'
                        }
                    }).
                    end(function(err, res) {
                        should.not.exist(err);

                        //assert the request was successful
                        res.status.should.be.equal(201);

                        //verify that the user details were saved correctly in the db
                        userManager.find({criteria: {_id: res.body._id}}).
                            then(function(user) {
                                //verify that the user details were saved correctly

                                user.firstName.should.be.equal('Elon');
                                user.lastName.should.be.equal('Musk');
                                user.address.line1.should.be.equal('45500 Fremont Blvd');
                                user.address.suburb.should.be.equal('Fremont');
                                user.address.state.should.be.equal('CA');
                                user.address.postcode.should.be.equal('94538');
                                user.address.country.should.be.equal('US');
                                user.billing.option.should.be.equal('PAYG');
                                user.instagram.username.should.be.equal('elonmusk');
                                user.signupComplete.should.be.equal(false);
                                user.active.should.be.equal(true);

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

    it('should throw a 400 when updating a user that does not exist /v1/users/:id', function(done) {
        agent.patch('/v1/users/55b3162aec3bb45701cad548').
            send({
                firstName: 'Elon'
            }).
            end(function(err, res) {
                //assert the request failed
                res.status.should.be.equal(400);

                done();
            });
    });

    afterEach(function(done) {
        User.remove({}, function() {
            done();
        });
    });
});
