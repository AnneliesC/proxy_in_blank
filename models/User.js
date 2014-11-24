// User schema
module.exports = function(mongoose){

	var bcrypt = require("bcrypt");

	var schema = mongoose.Schema({
		username: {type: String, required: true, unique: true},
		password: {type: String, required: true},
		email: {type: String, required: true, unique: true},
		active: {type: Boolean, default: true, required: true},
		creation_date: {type: Date, required: true, default: new Date()},
		admin: {type: Boolean, default: false, required: true}
	});

	schema.pre("save", function(next){
		var user = this;
		if(!user.isModified("password")){
			next();
		}
		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(user.password, salt, function(err, hash){
				user.password = hash;
				next();
			});
		});
	});

	schema.methods.comparePassword = function(password, cb){
		var user = this;
		bcrypt.compare(password, user.password, function(err, isMatch){
			if (err) {
				return cb(err);
			}
			return cb(null, isMatch);
		});
	};

	return mongoose.model("User",schema);

};
