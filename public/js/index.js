(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./_js/index.js":[function(require,module,exports){
/* jshint newcap: false */

require("./modules/util/Polyfill");

var Headtracker = require("./modules/video/Headtracker");

var headtracker;
var btnStart = document.getElementById("btnstart");

/* CLICKHANDLERS */

function _btnStartClickHandler(event){
	event.preventDefault();
	window.location = "./game";
}

/* HEAD TRACKING */

function _getUserMedia(){
	navigator.getUserMedia = (
		navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia);
}

function _userErrorHandler(error){
	console.log("[Index] webcam error");
}

function _initStream(stream){
	headtracker = new Headtracker(stream,"index");
	btnStart.addEventListener("click", _btnStartClickHandler);
}

/* INIT */

function init(){
	_getUserMedia();
	if (navigator.getUserMedia) {
		navigator.getUserMedia({audio: true, video: true}, _initStream, _userErrorHandler);
	}else{
		console.log("[Index] fallback");
	}
}

init();

},{"./modules/util/Polyfill":"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK3/proxy_in_blank/_js/modules/util/Polyfill.js","./modules/video/Headtracker":"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK3/proxy_in_blank/_js/modules/video/Headtracker.js"}],"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK3/proxy_in_blank/_js/modules/util/Polyfill.js":[function(require,module,exports){
module.exports = (function(){
	window.requestAnimFrame = require('./RequestAnimationFrame');
	window.requestAudio = require('./RequestAudio');
})();

},{"./RequestAnimationFrame":"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK3/proxy_in_blank/_js/modules/util/RequestAnimationFrame.js","./RequestAudio":"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK3/proxy_in_blank/_js/modules/util/RequestAudio.js"}],"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK3/proxy_in_blank/_js/modules/util/RequestAnimationFrame.js":[function(require,module,exports){
module.exports = (function(){
	return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element){window.setTimeout(callback, 1000 / 60); };
})();

},{}],"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK3/proxy_in_blank/_js/modules/util/RequestAudio.js":[function(require,module,exports){
module.exports = (function(){
  return  window.AudioContext || window.webkitAudioContext  || window.mozAudioContext;
})();

},{}],"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK3/proxy_in_blank/_js/modules/util/Util.js":[function(require,module,exports){
function Util(){

}

Util.randomStartPointTop = function(bounds){
	bounds.border = bounds.border || 0;
	return {
		x: bounds.border + Math.round(Math.random() * (bounds.width-(bounds.border*2))),
		y: -50
	};
};

Util.randomStatic = function(static){
	var rand = Math.round(Math.random()*(static.length-1));
	return static[rand];
};

Util.distanceBetweenPoints = function(position1, position2){

  var xs = position2.x - position1.x;
  xs = xs * xs;

  var ys = position2.y - position1.y;
  ys = ys * ys;

  return Math.sqrt(xs + ys);

};

function _normalize( value, minimum, maximum )
{
    return (value - minimum) / (maximum - minimum);
}

function _interpolate( normValue, minimum, maximum )
{
    return minimum + (maximum - minimum) * normValue;
}

Util.map = function( value, min1, max1, min2, max2 )
{
    return _interpolate( _normalize( value, min1, max1 ), min2, max2 );
};

module.exports = Util;

},{}],"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK3/proxy_in_blank/_js/modules/video/Headtracker.js":[function(require,module,exports){
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

},{"../util/Util":"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK3/proxy_in_blank/_js/modules/util/Util.js"}]},{},["./_js/index.js"]);
