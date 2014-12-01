var Util = require("../util/Util");

var htracker;
var xPosSpaceship;
var videoInput = document.getElementById("webcamPreview");
var canvasInput = document.getElementById("compare");
var spaceship = document.getElementById("rocket");

var statusMessages = {
	"whitebalance": "checking for stability of camera whitebalance",
	"detecting": "Detecting face",
	"hints": "Hmm. Detecting the face is taking a long time",
	"redetecting": "Lost track of face, redetecting",
	"lost": "Lost track of face",
	"found": "Tracking face"
};

var supportMessages = {
	"no getUserMedia": "Unfortunately, getUserMedia is not supported in your browser",
	"no camera": "No camera found. Using fallback video for facedetection."
};

/* HEAD TRACKING */

document.addEventListener("headtrackrStatus",function(event){
	var messagep;
	if (event.status in supportMessages) {
      messagep = document.getElementById('gUMMessage');
      //console.log("supportMessage",supportMessages[event.status]);
  } else if (event.status in statusMessages) {
      messagep = document.getElementById('headtrackerMessage');
      //console.log("statusMessage",statusMessages[event.status]);
  }
}, true);

htracker = new headtrackr.Tracker({
  calcAngles: true,
  ui: false,
  headPosition: false
});
htracker.init(videoInput, canvasInput);
htracker.start();

document.addEventListener("facetrackingEvent", function(event){
	var offset = Util.map(event.x,640*0.20,640-640*0.20,window.innerWidth-(spaceship.offsetWidth/2)-(spaceship.offsetWidth/2),spaceship.offsetWidth/2);
	spaceship.style.left = offset+"px";
	xPosSpaceship = offset+spaceship.offsetWidth/2;
});

function Headtracker(stream){
	console.log("[Headtracker]");

	videoInput.setAttribute("src",window.URL.createObjectURL(stream));
	spaceship.style.left = window.innerWidth/2 - spaceship.offsetWidth;
	xPosSpaceship = spaceship.offsetLeft + spaceship.offsetWidth/2;
}

Headtracker.getSpaceshipPosition = function(){
	return xPosSpaceship;
};

module.exports = Headtracker;
