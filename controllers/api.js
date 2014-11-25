
// haalt de users op uit de mongo database

module.exports = function(app, models){

	var base_path = "/api";

	app.get(base_path + "/users", function(req, res){
		models.User.find().exec(function(err, users){
			res.send(users);
		});
	});

	app.get(base_path + "/user/:id", function(req, res){
		models.User.findOne({_id: req.param}).exec(function(err, user){
			res.send(user);
		});
	});

};
