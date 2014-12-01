module.exports = {

	ensureLoggedIn: function(req, res, next){
		if(req.isAuthenticated()){
			return next();
		}
		return res.redirect("/highscore");
	},

	authenticate: function(req, res, passport, cb){
		/*passport.authenticate("local", function(err, user, info){
			if(err){
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
		})(req, res);*/
	},

	validate: function(user) {
		var errors = {};

		if(!user.username){
			errors.username = "FILL IN A GODDAMN USERNAME";
		}

		return errors;
	}

};
