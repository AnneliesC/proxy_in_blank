(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./_js/app.js":[function(require,module,exports){
(function(){

	var Util = require("./modules/util/Util");
	var Webcam = require("./modules/video/Webcam");
	var Comet = require("./modules/gameElements/Comet");

	var videoInput = document.getElementById("webcamPreview");
	var canvasInput = document.getElementById("compare");

	var statusMessages = {
		"whitebalance": "checking for stability of camera whitebalance",
		"detecting": "Detecting face",
		"hints": "Hmm. Detecting the face is taking a long time",
		"redetecting": "Lost track of face, redetecting",
		"lost": "Lost track of face",
		"found": "Tracking face"
	};

	var supportMessages = {
		"no getUserMedia": "Unfortunately, <a href='http://dev.w3.org/2011/webrtc/editor/getusermedia.html'>getUserMedia</a> is not supported in your browser. Try <a href='http://www.opera.com/browser/'>downloading Opera 12</a> or <a href='http://caniuse.com/stream'>another browser that supports getUserMedia</a>. Now using fallback video for facedetection.",
		"no camera": "No camera found. Using fallback video for facedetection."
	};

	var htracker;
	var page;

	// enkel op index pagina
	var light = document.getElementById("light");
	var btnStart = document.getElementById("btnStart");

	// enkel op game pagina
	var spaceship = document.getElementById("rocket");
	var svg = document.querySelector("svg");
	var bounds;

	function init(){

		bounds = {
			width: window.innerWidth,
			height: window.innerHeight,
			border: 10
		};

		page = "index";
		if(document.querySelector("body").getAttribute("class")){
			page = "game";
		}
		console.log("PAGE",page);

		initWebcam();
		if(page === "game"){
			initGameSettings();
		}else if(page === "index"){
			btnStart.addEventListener("click", btnStartClickHandler.bind(this));
		}
	}

	function btnStartClickHandler(event){
		event.preventDefault();
		window.location = "./game";
	}

	function createComets(){

		(function(){
		    setTimeout(arguments.callee, 1800);

		    var comet = new Comet(Util.randomStartPoint(bounds));
		    comet.target = {x:comet.position.x,y:window.innerHeight+comet.radius*2};
				comet.move = true;
				bean.on(comet,"done",function(){
					svg.removeChild(comet.element);
				});
				svg.appendChild(comet.element)
		})();
	}

	function initGameSettings(){
		console.log("[App] init game settings");
		createComets();
	}

	function userErrorHandler(error){
		console.log("[Webcam] video error");
	}

	function initWebcam(){
		navigator.getUserMedia  =
		navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia;

		if (navigator.getUserMedia) {
			navigator.getUserMedia({audio: true, video: true}, function(stream) {
				videoInput.setAttribute("src",window.URL.createObjectURL(stream));
			},userErrorHandler);
		} else {
			console.log("[Webcam] fallback");
		}
	}

	function checkHeadPosition(xPos,yPos){
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
		if (event.status in supportMessages) {
        messagep = document.getElementById('gUMMessage');
        console.log("supportMessage",supportMessages[event.status]);
    } else if (event.status in statusMessages) {
        messagep = document.getElementById('headtrackerMessage');
        console.log("statusMessage",statusMessages[event.status]);
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

		if(page === "game"){
	    var offset = Util.map(
	    	event.x,
	    	640*0.20,
	    	640-640*0.20,
	    	window.innerWidth-(spaceship.offsetWidth/2)-(spaceship.offsetWidth/2),
	    	spaceship.offsetWidth/2);
	    spaceship.style.left = offset+"px";
		}else if(page === "index"){
    	checkHeadPosition(event.x,event.y);
		}
	});

	init();

})();

},{"./modules/gameElements/Comet":"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK/proxy_in_blank/_js/modules/gameElements/Comet.js","./modules/util/Util":"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK/proxy_in_blank/_js/modules/util/Util.js","./modules/video/Webcam":"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK/proxy_in_blank/_js/modules/video/Webcam.js"}],"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK/proxy_in_blank/_js/modules/gameElements/Comet.js":[function(require,module,exports){
var SVGHelper = require("../svg/SVGHelper");
var Util = require("../util/Util");

function _onFrame(){
	if(this.move){
		this.position.y = this.position.y < this.target.y ? Math.min(this.position.y + this.speed, this.target.y) : Math.max(this.position.y + this.speed, this.target.y);
		var distance = Util.distanceBetweenPoints(this.position,this.target);

		if(distance < 1){
			bean.fire(this,"done");
		}

		this.element.setAttribute("cy",this.position.y);
	}
	requestAnimationFrame(_onFrame.bind(this));
}

function _create(){
	this.element = SVGHelper.createElement("circle");
	this.element.setAttribute("cx",this.position.x);
	this.element.setAttribute("cy",this.position.y);
	this.element.setAttribute("r",this.radius);
	this.element.setAttribute("fill",this.fill);
}

function Comet(position){
	this.position = position || {x:0,y:0};

	var min_speed = 4;
	var max_speed = 7;

	var min_radius = 10;
	var max_radius = 30;

	this.radius = min_radius + Math.round(Math.random()*(max_radius-min_radius));
	this.speed = min_speed + Math.round(Math.random()*(max_speed-min_speed));
	this.fill = "#9e3c29";

	_create.call(this);
	_onFrame.call(this);
}

module.exports = Comet;

},{"../svg/SVGHelper":"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK/proxy_in_blank/_js/modules/svg/SVGHelper.js","../util/Util":"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK/proxy_in_blank/_js/modules/util/Util.js"}],"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK/proxy_in_blank/_js/modules/svg/SVGHelper.js":[function(require,module,exports){
var namespace = "http://www.w3.org/2000/svg";

function SVGHelper(){

}

SVGHelper.createElement = function(el){
	return document.createElementNS(namespace, el);
};

module.exports = SVGHelper;

},{}],"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK/proxy_in_blank/_js/modules/util/Util.js":[function(require,module,exports){
function Util(){

}

Util.randomStartPoint = function(bounds){
	bounds.border = bounds.border || 0;
	return {
		x: bounds.border + Math.round(Math.random() * (bounds.width-(bounds.border*2))),
		y: 0
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

},{}],"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK/proxy_in_blank/_js/modules/video/Webcam.js":[function(require,module,exports){
var Util = require("../util/Util");

function Webcam(element){
	console.log("[Webcam]");
}

module.exports = Webcam;

},{"../util/Util":"/Users/Annelies/Documents/Howest/S5/Rich Media Development/OPDRACHTEN/PROXY_IN_BLANK/proxy_in_blank/_js/modules/util/Util.js"}]},{},["./_js/app.js"]);
