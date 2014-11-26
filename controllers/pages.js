// main page

module.exports = function(app){

	app.get("/", function(req,res){
		res.render("index",{title: "Setup"});
	});

	app.get("/:id", function(req,res){
		// url id meegeven aan
		res.render("index",{title: "Setup", urlid: req.params.id});
	});

	app.get("/game", function(req,res){
		res.render("game",{title: "The game"});
		// mag alleen mogelijk zijn wanneer geconnecteerd met iphone
		// connectie lost -> index
	});

};
