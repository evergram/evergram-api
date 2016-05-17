/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */

var common = require('evergram-common');
var userManager = common.user.manager;
var userMapper = common.mapper.instagramUser;
var logger = common.utils.logger;
var passport = require('passport');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    userManager.find({criteria: {_id: id}}).
        then(function(user) {
            done(null, user);
        }).
        fail(function(err) {
            done(err);
        });
});

/**
 * Handles the passport callback
 *
 * @param config
 * @returns {*}
 */
function init(config) {
    var InstagramStrategy = require('passport-instagram').Strategy;

    return new InstagramStrategy({
        clientID: config.clientID,
        clientSecret: config.clientSecret,
        callbackURL: config.callbackURL,
        passReqToCallback: true
    }, function(req, authToken, refreshToken, profile, done) {
        var options;

        if (!!req.session.auth.id) {
            options = { criteria: {'_id': req.session.auth.id} };
        } else {
            options = { criteria: {'instagram.id': profile.id} };
        }

        userManager.find(options).
            then(function(user) {
                if (!!user) {
                    logger.info('User ' + profile.username +
                        ' already exists. We will re-save the token and instagram profile.');
                }

                //add the access token to the profile
                profile.authToken = authToken;

                return userManager.create(userMapper.toModel(profile, user)).
                    then(function(user) {
                        return done(null, user);
                    }).
                    fail(function(err) {
                        logger.error('Error creating user account for user (' + profile.username + ')');
                        return done(err);
                    });
            }).
            fail(function(err) {
                logger.error('getInstagramAuthStrategy(): ' + err);
                done(err);
            });
    });
}

// use the instagram strategies
passport.use(init(common.config.instagram));
