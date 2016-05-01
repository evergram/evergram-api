/**
 * @author Richard O'Brien <richard@printwithpixy.com>
 */

var common = require('evergram-common');
var userManager = common.user.manager;
var userMapper = common.mapper.facebookUser;		// TODO: Need to create Facebook User Mapper in evergram-common
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
    var FacebookStrategy = require('passport-facebook').Strategy;

    return new FacebookStrategy({
        clientID: config.clientID,
        clientSecret: config.clientSecret,
        callbackURL: config.callbackURL,
        profileFields: ['id','displayName','name','emails','picture.type(large)','link'],
        passReqToCallback: true
    }, function(req, authToken, refreshToken, profile, done) {

        var options;
        
        if (!!req.session.auth.id) {
            options = { criteria: {'_id': req.session.auth.id} };
        } else {
            options = { criteria: {'facebook.id': profile.id} };
        }

        userManager.find(options).
            then(function(user) {
                if (!!user) {
                    logger.info('User ' + profile.displayName + ' (id:' + user._id + ')' +
                        ' already exists. We will re-save the token and facebook profile.');
                }

                //add the access token to the profile
                profile.authToken = authToken;

                return userManager.create(userMapper.toModel(profile, user)).
                    then(function(user) {
                        return done(null, user);
                    }).
                    fail(function(err) {
                        logger.error('Error creating user account for Facebook user ' + profile.displayName);
                        return done(err);
                    });
            }).
            fail(function(err) {
                logger.error('FacebookAuthStrategy: ' + err);
                done(err);
            });
    });
}

// use the instagram strategies
passport.use(init(common.config.facebook));