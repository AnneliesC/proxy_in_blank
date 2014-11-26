/* globals process:true */

var port = process.env.PORT;

var express = require("express");
var app = express();
var server = require('http').Server(app);

//** CONFIG **//
require("./config/middleware.js")(app, express);
require("./config/handlebars.js")(app);
var mongoose = require("./config/mongoose.js")();

//** MODULES **//
require("./modules/cosmic-race.js")(server);

//** ROUTES **//
require("./controllers/pages.js")(app);
require("./controllers/api.js")(app, mongoose.models);

var port = process.env.PORT;

server.listen(port, function() {
  console.log('Server listening at port ',port, 'in', process.env.NODE_ENV,"mode");
});
