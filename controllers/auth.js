module.exports = function(app, auth, passport, util, User){

	app.get("/highscore", function(req,res){
		console.log("miauw");
		User.find().sort( { points: -1 } ).limit(5).exec(function(err, highscore){

			//hier eerst nog controleren of de speler een record heeft verbroken met zijn tijd of niet.

			res.render("highscore",{title: "highscore", bodyClass:"gamestarted", highscore: highscore});
		});
	});

	app.post("/highscore", function(req,res){
		var post = req.body;
		var errors = auth.validate(post);

		if(util.isEmpty(errors)){
			console.log("geen errors");
			var user = new User(post);
			user.save(function(err){
				if(err){
					var error = "TGAAT NIET PROBEER MORGEN NOG EENS";
					if(err.code === 11000){
						error = "TZIT AL NE MUTN IP UJ USERNAME";
					}
					console.log(err);
					res.render("highscore", {error: error, title: "highscore"});
				} else {
					User.find().sort( { points: -1 } ).limit(5).exec(function(err, highscore){
						res.render("highscore",{title: "highscore", bodyClass:"gamestarted", highscore: highscore, highscoresend: true });
					});
				}
			});
		} else {

			console.log("errors");
			User.find().sort( { points: -1 } ).limit(5).exec(function(err, highscore){
				res.render("highscore",{title: "highscore", bodyClass:"gamestarted", highscore: highscore,
				error: "Please fill in all fields",
				post: post,
				errors: errors
				});
			});
		}
		//res.redirect("/");
	});
};
