// User schema
module.exports = function(mongoose){

	var schema = mongoose.Schema({
		username: {type: String, required: true},
		points: {type: Number, required: true, default: 0},
		notifiable: {type: Boolean, default: false}
	});

	return mongoose.model("User",schema);
};
