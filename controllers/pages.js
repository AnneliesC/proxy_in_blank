// main page

module.exports = function(app){

	app.get("/", function(req,res){
		res.render("index",{title: "Setup"});
	});

	app.get("/game", function(req,res){
		res.render("game",{title: "Game", bodyClass:"gameStarted"});
	});

};
