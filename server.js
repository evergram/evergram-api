/**
 * Module dependencies
 */

var port = process.env.PORT || 8080;
var app = require('./app');

//start app
app.listen(port);
console.log('Express app started on port ' + port);

/**
 * Expose
 */

module.exports = app;
