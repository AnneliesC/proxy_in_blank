/* globals process:true */

var express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

io.on('connection', function(socket) {});

//** CONFIG **//
require("./config/middleware.js")(app, express);
require("./config/handlebars.js")(app);
var mongoose = require("./config/mongoose.js")();

//** MODULES **//
var util = require("./modules/util.js");

//** ROUTES **//
require("./controllers/pages.js")(app, util, mongoose.models.User, io);
require("./controllers/api.js")(app, mongoose.models);

//var port = process.env.PORT;

server.listen(process.env.PORT, function() {
  console.log('Server listening at port ', process.env.PORT, 'in', process.env.NODE_ENV,"mode");
});
