// api routes

module.exports = function(app, auth, models){

	var base_path = "/api";

	app.get(base_path + "/users", auth.ensureLoggedIn, function(req, res){
		models.User.find().exec(function(err, users){
			res.send(users);
		});
	});

	app.get(base_path + "/user/:id", auth.ensureLoggedIn, function(req, res){
		models.User.findOne({_id: req.param}).exec(function(err, user){
			res.send(user);
		});
	});


};
