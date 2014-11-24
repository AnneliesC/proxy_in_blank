// mongoose config
/* globals process: true*/

module.exports = function(){

	var mongoose = require("mongoose");
	var mongodb_url = process.env.MONGO_URL;

	mongoose.connect(mongodb_url);

	var models_path = "../models/";
	require(models_path + "User.js")(mongoose);


	return mongoose;

};

// register schemas
