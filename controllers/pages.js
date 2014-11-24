// main page

module.exports = function(app, auth){

	app.get("/", auth.ensureLoggedIn, function(req,res){
		res.render("index",{title: "home"});
	});

	app.get("/app", auth.ensureLoggedIn, function(req,res){
		res.redirect("/");
	});

	app.get("/admin", auth.ensureAdmin, function(req,res){
		res.send("PROFICIAT JE BENT ADMIN, DOEI");
	});

};
