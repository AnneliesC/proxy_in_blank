module.exports = function(app, User){

	var passport = require("passport");
	var PassportLocal = require("passport-local").Strategy;

	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user);
		});
	});

	function passportLocal_handler(username, password, cb){
		//username, password
		//cb(error, user, ..)
		/*var checks = [
			{"username":username},
			{"email":username}
		];

		User.findOne({$or:checks}, function(err, user){
			if(err){
				return cb(err);
			}
			if(!user){
				return cb(null, false, {message: "unknown user"});
			}

			user.comparePassword(password, function(err, isMatch){
				if(err){
					return cb(err);
				}
				if(isMatch){
					return cb(null, user);
				}else{
						return cb(null, false, {message: "invalid password"});
				}
			});

		});*/
	}

	passport.use(new PassportLocal(passportLocal_handler));

	app.use(passport.initialize());
	app.use(passport.session());

	return passport;
};
