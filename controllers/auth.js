module.exports = function(app, auth, passport, util, User){

	app.get("/highscore", function(req,res){
		res.render("submit",{title: "submit"});
	});

	app.post("/highscore", function(req,res){
		auth.authenticate(req, res, passport, function(error){
			if(error){
				return res.render("highscore", {
					error: error,
					title: "highscore"
				});
			}
			return res.redirect("/");
		});
	});
};
