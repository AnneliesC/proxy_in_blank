// auth module
// var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = {

	login: function(req, user, cb){
		req.logIn(user, function(err){
			if(err){
				return cb(err.msg);
			}
			return cb();
		});
	},

	ensureLoggedIn: function(req, res, next){
		if(req.isAuthenticated()){
			return next();
		} else {
			return res.redirect("/login");
		}
	},

	ensureAdmin: function(req, res, next){
		if(req.isAuthenticated()){
			if(!req.user.admin){
				return res.redirect("/");
			}
			return next();
		} else {
			return res.redirect("/login");
		}
	},

	authenticate: function(req, res, passport, cb){
		passport.authenticate("local", function(err, user, info){
			if (err) {
				return cb(err);
			}
			if(!user){
				return cb(info.message);
			}
			req.logIn(user, function(err){
				if(err){
					return cb(err.msg);
				}
				return cb();
			});
		})(req, res);
	},

	validate: function(user) {
		var errors = {};
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		if(!user.username){
			errors.username = "FILL IN A GODDAMN USERNAME";
		}

		if(!re.test(user.email)){
			errors.email = "WHO THE FUCK DOESNT HAVE A FUCKING EMAIL ADRESS?? ITS 2015!!";
		}

		if(!user.password){
			errors.password = "FILL YOUR PASSWORD, EVEN IF ITS PUSSYDESTROYER69, I DONT GIVE A DAMN";
		}

		if((user.password !== user.password2) && user.password){
			errors.password2 = "YOU CANT EVEN TYPE YOUR PASSWORD 2 TIMES? YOU LOSER!";
		}

		return errors;
	}

};
