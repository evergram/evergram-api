/**
 * Module dependencies.
 */

var express = require('express');
var common = require('evergram-common');
var session = require('express-session');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoStore = require('connect-mongo')(session);

var passport = require('passport');

var app = express();

// Compression middleware (should be placed before express.static)
app.use(compression({
    threshold: 512
}));

// bodyParser should be above methodOverride
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());

// CookieParser should be above session
app.use(cookieParser());
app.use(cookieSession({secret: 'secret'}));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'evergram',
    store: new mongoStore({
        url: common.config.db,
        collection: 'sessions'
    })
}));

// use passport session
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use(require('./routes.js'));

//init db
common.db.init();

//ensure instagram passport auth strategy is instantiated
common.instagram.initAuthStrategy();

module.exports = app;