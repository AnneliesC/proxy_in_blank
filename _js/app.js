var connect_button = document.getElementsByTagName("cosmic-race-qr-code")[0];
//var you = document.querySelector("#you");
var stranger = document.querySelector("#stranger");

// you.addEventListener("playingstream", (function(e){
// connect_button.connect(e.detail.stream);
// }).bind(this));

connect_button.addEventListener("connected", (function(e){
	//you.label = "you: " + e.currentTarget.peerId;
}).bind(this));

connect_button.addEventListener("strangerfound", (function(e){
	stranger.stream = e.detail.stream;
}).bind(this));

connect_button.addEventListener("strangerleft", (function(e){
	stranger.removeStream();
}).bind(this));
