module.exports = {

	isEmpty: function(obj) {
		for(var key in obj) {
			if(obj.hasOwnProperty(key)){
				return false;
			}
		}
		return true;
	},

	validate: function(user) {
		var errors = {};

		if(!user.username){
			errors.username = "Vul een Nickname in!";
		}

		return errors;
	}

};
