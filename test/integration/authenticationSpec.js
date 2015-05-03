var request = require('supertest');
var should = require('should');

describe('AuthenticationApi', function() {

    var app = require('../../app');
    var agent = request.agent(app);

    it('should redirect to instagram on /auth/instagram', function(done) {
        agent
            .get('/auth/instagram')
            .end(function(err, res) {
                should.not.exist(err);

                res.status.should.be.equal(302);
                res.headers.location.should.startWith('https://api.instagram.com/oauth/authorize/');

                //TODO should have session params

                done();
            });
    });

    //TODO Implement this test properly with instagram / passport stubs
    xit('should receive a callback from instagram on /auth/instagram/callback', function(done) {
        agent
            .get('/auth/instagram/callback')
            .end(function(err, res) {
                should.not.exist(err);
                res.status.should.be.equal(302);

                //TODO should have session params to as a querystring

                //TODO should have a user in the db

                done();
            });
    });
});
