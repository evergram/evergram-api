/**
 * Module dependencies.
 */

var express = require('express');
var common = require('evergram-common');
var session = require('express-session');
var validator = require('express-validator');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var MongoStore = require('connect-mongo')(session);
var config = require('./config');
var passport = require('passport');

//init authentication services for passport
require('./service/authentication');

var app = express();

// Compression middleware (should be placed before express.static)
app.use(compression({
    threshold: 512
}));

// bodyParser should be above methodOverride
app.use(bodyParser.json());

// line must follow directly after bodyParser initialisation
app.use(validator());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());

// CookieParser should be above session
app.use(cookieParser());
app.use(cookieSession({secret: 'secret'}));
app.use(session({
    path: '/',
    resave: true,
    saveUninitialized: true,
    secret: 'evergram',
    store: new MongoStore({
        url: common.config.db,
        collection: 'sessions'
    })
}));

// use passport session
app.use(passport.initialize());
app.use(passport.session());

/**
 * Routes
 */
app.route('/')
    .get(function(req, res) {
        res.status(204).send();
    });

// routes
app.use(config.api.version, require('./routes.js'));

//init db
common.db.connect();

module.exports = app;
