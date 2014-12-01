// main page

module.exports = function(app, auth){

	app.get("/", function(req,res){
		res.render("index",{title: "Setup"});
	});

	app.get("/game", function(req,res){
		res.render("game",{title: "Game", bodyClass:"gamestarted"});
	});

	app.get("/highscore", function(req,res){
		res.render("highscore",{title: "Highscore", bodyClass:"gamestarted"});
	});

};
