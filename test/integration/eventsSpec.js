var request = require('supertest');
var should = require('should');

describe('EventsApi', function() {
    var app = require('../../app');
    var agent = request.agent(app);

    //TODO Implement this test
    xit('should track the signed up event on /events/signed-up', function(done) {
        agent
            .post('/v1/events/signed-up')
            .send()
            .end(function(err, res) {

                done();
            });
    });
});
