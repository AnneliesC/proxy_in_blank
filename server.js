/* globals process:true */

var express = require("express");
var app = express();
var server = require('http').Server(app);

//** CONFIG **//
require("./config/middleware.js")(app, express);
require("./config/handlebars.js")(app);
var mongoose = require("./config/mongoose.js")();
var passport = require("./config/passport.js")(app, mongoose.models.User);

//** MODULES **//
require("./modules/cosmicrace.js")(server);
var auth = require("./modules/auth.js");
var util = require("./modules/util.js");

//** ROUTES **//
require("./controllers/pages.js")(app, auth);
require("./controllers/auth.js")(app, auth, passport, util, mongoose.models.User);
require("./controllers/api.js")(app, auth, mongoose.models);

//var port = process.env.PORT;

server.listen(process.env.PORT, function() {
  console.log('Server listening at port ', process.env.PORT, 'in', process.env.NODE_ENV,"mode");
});
