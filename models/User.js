// User schema
module.exports = function(mongoose){

	var schema = mongoose.Schema({
		username: {type: String, required: true, unique: true},
		points: {type: Number, required: true},
		notifiable: {type: Boolean, default: false}
	});

	return mongoose.model("User",schema);
};
