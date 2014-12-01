// User schema
module.exports = function(mongoose){

	var schema = mongoose.Schema({
		username: {type: String, required: true, unique: true},
		points: {type: String, required: true},
		active: {type: Boolean, default: false}
	});

	/*schema.pre("save", function(next){
		var user = this;
	});*/

	return mongoose.model("User",schema);
};
