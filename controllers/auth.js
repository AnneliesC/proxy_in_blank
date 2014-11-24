// login
// logout
// register
// main page

module.exports = function(app, auth, passport, util, User){

	app.get("/login", function(req,res){
		res.render("login",{title: "login"});
	});

	app.post("/login", function(req,res){
		auth.authenticate(req, res, passport, function(error){
			if (error) {
				return res.render("login", {error: error, title:"login"});
			}
			return res.redirect("/");
		});
	});

	app.get("/logout", function(req, res){
		req.logout();
		res.redirect("/login");
	});

	app.get("/register", function(req,res){
		res.render("register",{title: "register"});
	});

	app.post("/register", function(req,res){
		var post = req.body;
		var errors = auth.validate(post);

		if(util.isEmpty(errors)){
			var user = new User(post);
			user.save(function(err){
				if(err){
					var error = "TGAAT NIET PROBEER MORGEN NOG EENS";
					if(err.code === 11000){
						error = "TZIT AL NE MUTN IP UJ USERNAME";
					}
					res.render("register", {title: "register", error: error});
				} else {
					res.redirect("/");
				}
			});
		} else {
			res.render("register", {title: "register", error: "VUL ALLES IN", errors: errors, post: post});
		}
		//res.redirect("/");
	});

};
