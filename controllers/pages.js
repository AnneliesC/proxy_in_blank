module.exports = function(app, util, User, io){

	app.get("/", function(req,res){
		res.render("index",{title: "Setup"});
	});

	app.get("/game", function(req,res){
		console.log("[Server] Get highscores");
		User.find().sort( { points: -1 } ).limit(5).exec(function(err, highscore){
			res.render("game",{title: "Game", bodyClass:"gamestarted", highscore: highscore});
		});
	});

	app.post("/game", function(req,res){
		var post = req.body;
		var errors = util.validate(post);

		if(util.isEmpty(errors)){
		console.log("[Server] No errors");
			var user = new User(post);
			user.save(function(err){
				if(err){
					var error = "Er is iets fout gelopen";
					if(err.code === 11000){
						error = "Nickname is al bezet";
					}
					console.log(err);
					res.render("game", {error: error, title: "Game"});
				} else {
					User.find().sort( { points: -1 } ).limit(5).exec(function(err, highscore){
						io.sockets.emit('message', user.username);
						res.render("game",{title: "Game", bodyClass:"gamestarted", highscore: highscore, highscoresend: true });
					});
				}
			});
		}else{

			console.log("[Server] Errors");
			User.find().sort( { points: -1 } ).limit(5).exec(function(err, highscore){
				res.render("game",{title: "Game", bodyClass:"gamestarted", highscore: highscore,
				error: "Vul je Nickname in.",
				post: post,
				errors: errors
				});
			});
		}
	});
};
