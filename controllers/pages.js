// main page

module.exports = function(app){

	app.get("/", function(req,res){
		res.render("index",{title: ""});
	});

	app.get("/game", function(req,res){
		res.render("game",{title: "The game"});
		// mag alleen mogelijk zijn wanneer geconnecteerd met iphone
		// connectie lost -> index
	});

};
