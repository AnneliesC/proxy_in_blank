// User schema
module.exports = function(mongoose){

	var schema = mongoose.Schema({
		username: {type: String, required: true, unique: true},
		points: {type: String, required: true},
		notifiable: {type: Boolean, default: false}
	});

	/*schema.pre("save", function(next){
		var user = this;
	});*/

	return mongoose.model("User",schema);
};
