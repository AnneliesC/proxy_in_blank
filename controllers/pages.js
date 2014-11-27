// main page

module.exports = function(app){

	app.get("/", function(req,res){
		// render index -> url wordt gegenereerd in een component
		res.render("index",{title: "Setup"});
	});

	app.get("/:id", function(req,res){
		// als er een id in de url aanwezig is -> render controls pagina (mobile)
		res.render("controls",{title: "Controls", urlid: req.params.id});
	});

	app.get("/game", function(req,res){
		res.render("game",{title: "The game"});
		// mag alleen mogelijk zijn wanneer geconnecteerd met iphone
		// connectie lost -> index
	});

};
