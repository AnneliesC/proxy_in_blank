var Util = require("../util/Util");

var htracker,page;
var xPosSpaceship;
var videoInput = document.getElementById("webcamPreview");
var canvasInput = document.getElementById("compare");
var spaceship = document.getElementById("rocket");

var light = document.getElementById("light");
var btnStart = document.getElementById("btnstart");

var that;

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
	"no camera": "No camera found. Using fallback video for facedetection"
};

/* HEAD TRACKING */
function _checkHeadPosition(xPos,yPos){
	if(xPos > 280 && xPos < 380 && light.getAttribute("class") === "red"){
		light.setAttribute("class","green");
		btnStart.setAttribute("class","");
	}else if((xPos < 280 || xPos > 380) && light.getAttribute("class") === "green"){
		light.setAttribute("class","red");
		btnStart.setAttribute("class","disabled");
	}
}

document.addEventListener("headtrackrStatus",function(event){
	var messagep;
	if (event.status in supportMessages){
      messagep = document.getElementById('gUMMessage');
      //console.log("supportMessage",supportMessages[event.status]);
  }else if(event.status in statusMessages){
      messagep = document.getElementById('headtrackerMessage');
      //console.log("statusMessage",statusMessages[event.status]);
  }
},true);

htracker = new headtrackr.Tracker({
  ui: false,
  headPosition: false,
  facedetection: 100
});
htracker.init(videoInput, canvasInput);
htracker.start();

document.addEventListener("facetrackingEvent", function(event){
	if(page === "game"){
		var offset = Util.map(event.x,640*0.30,640-640*0.30,window.innerWidth-(spaceship.offsetWidth/2)-(spaceship.offsetWidth/2),spaceship.offsetWidth/2);
		spaceship.style.left = offset+"px";
		xPosSpaceship = offset+spaceship.offsetWidth/2;
		bean.fire(that,"moved");
	}else if(page === "index"){
    _checkHeadPosition(event.x,event.y);
	}
});

function Headtracker(stream,currentPage){
	console.log("[Headtracker]");
	that = this;
	page = currentPage;
	videoInput.setAttribute("src",window.URL.createObjectURL(stream));
	if(page === "game"){
		spaceship.style.left = window.innerWidth/2 - spaceship.offsetWidth;
		xPosSpaceship = spaceship.offsetLeft + spaceship.offsetWidth/2;
	}
}

Headtracker.getSpaceshipPosition = function(){
	return xPosSpaceship;
};

module.exports = Headtracker;
