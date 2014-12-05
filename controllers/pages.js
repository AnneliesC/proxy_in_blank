// main page


module.exports = function(app, util, User, io){


	app.get("/", function(req,res){
		res.render("index",{title: "Setup"});
	});

	app.get("/game", function(req,res){
		console.log("[Server] Get highscores");
		User.find().sort( { points: -1 } ).limit(5).exec(function(err, highscore){
			//hier eerst nog controleren of de speler een record heeft verbroken met zijn tijd of niet.
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
					var error = "TGAAT NIET PROBEER MORGEN NOG EENS";
					if(err.code === 11000){
						error = "TZIT AL NE MUTN IP UJ USERNAME";
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
				error: "Please fill in all fields",
				post: post,
				errors: errors
				});
			});
		}
	});

	app.get("/highscore", function(req,res){
		console.log("[Server] Get highscores");
		User.find().sort( { points: -1 } ).limit(5).exec(function(err, highscore){

			//hier eerst nog controleren of de speler een record heeft verbroken met zijn tijd of niet.

			res.render("highscore",{title: "Highscore", bodyClass:"gamestarted", highscore: highscore});
		});
	});

	app.post("/highscore", function(req,res){
		var post = req.body;
		var errors = util.validate(post);

		if(util.isEmpty(errors)){
		console.log("[Server] No errors");
			var user = new User(post);
			user.save(function(err){
				if(err){
					var error = "werkt niet";
					res.render("highscore", {error: error, title: "highscore"});
				} else {
					User.find().sort( { points: -1 } ).limit(5).exec(function(err, highscore){
						res.render("highscore",{title: "highscore", bodyClass:"gamestarted", highscore: highscore, highscoresend: true });
					});
				}
			});
		}else{

			console.log("[Server] Errors");
			User.find().sort( { points: -1 } ).limit(5).exec(function(err, highscore){
				res.render("highscore",{title: "highscore", bodyClass:"gamestarted", highscore: highscore,
				error: "Please fill in all fields",
				post: post,
				errors: errors
				});
			});
		}
	});

};
