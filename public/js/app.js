(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./_js/app.js":[function(require,module,exports){
/* jshint newcap: false */

(function(){

	var Util = require("./modules/util/Util");
	//var Webcam = require("./modules/video/Webcam");
	var Comet = require("./modules/gameElements/Comet");
	var Laser = require("./modules/gameElements/Laser");

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
		"no getUserMedia": "Unfortunately, getUserMedia is not supported in your browser",
		"no camera": "No camera found. Using fallback video for facedetection."
	};

	var htracker;
	var page;

	// enkel op index pagina
	var light = document.getElementById("light");
	var btnstart = document.getElementById("btnstart");

	// enkel op game pagina
	var spaceship = document.getElementById("rocket");
	var btnInfo = document.getElementById("btnInfo");
	var lblScore = document.getElementById("lblScore");
	var lblTime = document.getElementById("lblTime");
	var lblCountdown = document.getElementById("countdown");
	var lblTips = document.getElementById("tips");
	var svg = document.querySelector("svg");
	var bounds,xPosSpaceship,comets,lasers;
	var countdownTime = 3;
	var countdownInterval,timerInterval,cometsInterval;
	var score,time;

  var audioContext,analyserNode,javascriptNode,amplitudeArray,audioStream,currentValue;
  var sampleSize = 1024;
	var prevXpos = 630;

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

		getUserMedia();
		initWebcam();

		if(page === "game"){
			resetGameSettings();
			btnInfo.addEventListener("click", btnInfoClickHandler);
		}else if(page === "index"){
			btnstart.addEventListener("click", btnstartClickHandler);
		}
	}

	function btnstartClickHandler(event){
		event.preventDefault();
		window.location = "./game";
	}

	function btnInfoClickHandler(event){
		event.preventDefault();
	}

	/* GAME LOGIC  */

	function createComet(){
    var comet = new Comet(Util.randomStartPointTop(bounds));
    comet.target = {x:comet.position.x,y:window.innerHeight+comet.radius*2};
		comet.move = true;
		bean.on(comet,"done",function(){
			svg.removeChild(comet.element);
			comets.splice(comets.indexOf(comet),1);
		});
		svg.appendChild(comet.element);
		comets.push(comet);

		for(var i=0;i<lasers.length;i++){
			lasers[i].comets = comets;
		}
	}

	function createLaser(){
		var laser = new Laser({x:xPosSpaceship,y:window.innerHeight-120},comets);
		laser.target = {x:laser.position.x,y:50};
		laser.move = true;
		bean.on(laser,"top",function(){
			svg.removeChild(laser.element);
			lasers.splice(lasers.indexOf(laser),1);
		});
		bean.on(laser,"hit",function(){
			svg.removeChild(laser.hit.element);
			comets.splice(comets.indexOf(laser.hit),1);
			svg.removeChild(laser.element);
			lasers.splice(lasers.indexOf(laser),1);
			score = score + 5;
			updateLabels();
		});
		svg.appendChild(laser.element);
		lasers.push(laser);
	}

	function resetGameSettings(){
		comets = [];
		lasers = [];
		score = 0;
		time = 0;
		lblScore.innerHTML = "0";
		lblTime.innerHTML = "00:00";
	}

	function updateLabels(){
		var minutes = Math.floor(time/60);
		var seconds = time - minutes * 60;
		if(minutes.toString().length === 1){minutes = "0"+minutes;}
		if(seconds.toString().length === 1){seconds = "0"+seconds;}

		lblScore.innerHTML = score;
		lblTime.innerHTML = minutes+":"+seconds;
	}

	function timer(){
		time = time + 1;
		score = score + 2;
		updateLabels();
	}

	function startGame(){
		console.log("[App] init game settings");
		cometsInterval = setInterval(createComet, 2000);
		timerInterval = setInterval(timer, 1000);
	}

	function countdown(){
		countdownTime = countdownTime - 1;
		lblCountdown.innerHTML = countdownTime;
		if(countdownTime < 0){
			clearInterval(countdownInterval);
			document.getElementById("game").removeChild(lblCountdown);
			document.getElementById("game").removeChild(lblTips);
			startGame();
		}
	}

	function startCountDown(){
		lblCountdown.innerHTML = countdownTime;
		countdownInterval = setInterval(countdown, 1000);
	}

	/* WEBCAM */

	function userErrorHandler(error){
		console.log("[Webcam] video error");
	}

	function getUserMedia(){
		navigator.getUserMedia = (
			navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia);
	}

	function initWebcam(){
		if (navigator.getUserMedia) {
			navigator.getUserMedia({audio: true, video: true}, initVideoAudio,userErrorHandler);
		} else {
			console.log("[Webcam] fallback");
		}
	}

	function initVideo(stream){
		videoInput.setAttribute("src",window.URL.createObjectURL(stream));
		startCountDown();
	}

	/* DETECT CLAPPING  */

	function initAudioContext(){
		console.log("[App] initializing Audio");

    try {
      audioContext = new AudioContext();
    } catch(e) {
      console.log('[App] Web Audio API is not supported in this browser');
    }
	}

	function initVideoAudio(stream){
		initVideo(stream);
		if(page === "game"){
			initAudioContext();
			initAudio(stream);
		}
	}

	function initAudio(stream){
    var sourceNode = audioContext.createMediaStreamSource(stream);
    audioStream = stream;

    analyserNode   = audioContext.createAnalyser();
    javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);
    amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);

    javascriptNode.onaudioprocess = function(){

        amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteTimeDomainData(amplitudeArray);
        requestAnimFrame(checkForClapping);
    };

    sourceNode.connect(analyserNode);
    analyserNode.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
	}

  function checkForClapping(){
    var minValue = 9999999;
    var maxValue = 0;

    for (var i = 0; i < amplitudeArray.length; i++) {
        var value = amplitudeArray[i] / 256;
        if(value > maxValue) {
            maxValue = value;
        } else if(value < minValue) {
            minValue = value;
        }
    }

    currentValue = (maxValue-minValue)*1000;
    if (currentValue > 600){
        if(xPosSpaceship !== 0){createLaser();}
    }
  }

	/* HEAD TRACKING */

	function checkHeadPosition(xPos,yPos){
		if(xPos > 280 && xPos < 380 && light.getAttribute("class") === "red"){
			light.setAttribute("class","green");
			btnstart.setAttribute("class","");
		}else if((xPos < 280 || xPos > 380) && light.getAttribute("class") === "green"){
			light.setAttribute("class","red");
			btnstart.setAttribute("class","disabled");
		}
	}

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

		if(page === "game"){
			var offset = Util.map(event.x,640*0.20,640-640*0.20,window.innerWidth-(spaceship.offsetWidth/2)-(spaceship.offsetWidth/2),spaceship.offsetWidth/2);
			spaceship.style.left = offset+"px";
			xPosSpaceship = offset+spaceship.offsetWidth/2;

			if(offset > prevXpos + 50){
				spaceship.removeClass("rotateLeft").addClass("rotateRight");
			}else if(offset < prevXpos - 50){
				spaceship.removeClass("rotateRight").addClass("rotateLeft");
			}else{
				spaceship.removeClass("rotateRight");
				spaceship.removeClass("rotateLeft");
			}
			prevXpos = offset;
		}else if(page === "index"){
			checkHeadPosition(event.x,event.y);
		}
	});

	init();

})();

},{"./modules/gameElements/Comet":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/gameElements/Comet.js","./modules/gameElements/Laser":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/gameElements/Laser.js","./modules/util/Util":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/Util.js"}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/gameElements/Comet.js":[function(require,module,exports){
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

	var min_radius = 25;
	var max_radius = 50;

	this.radius = min_radius + Math.round(Math.random()*(max_radius-min_radius));
	this.speed = min_speed + Math.round(Math.random()*(max_speed-min_speed));
	this.fill = "#9e3c29";

	_create.call(this);
	_onFrame.call(this);
}

module.exports = Comet;

},{"../svg/SVGHelper":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/svg/SVGHelper.js","../util/Util":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/Util.js"}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/gameElements/Laser.js":[function(require,module,exports){
var SVGHelper = require("../svg/SVGHelper");
var Util = require("../util/Util");

function _onFrame(){
	if(this.move){

		this.position.y = this.position.y - this.speed;
		if(this.position.y < -this.radius){
			bean.fire(this,"top");
		}

		for(var i=0;i<this.comets.length;i++){
			var distance = Util.distanceBetweenPoints(this.position,this.comets[i].position);

			if(distance < this.comets[i].radius+this.radius){
				this.hit = this.comets[i];
				bean.fire(this,"hit");
			}
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
	this.element.setAttribute("class","red");
}

function Laser(position,comets){
	this.position = position || {x:0,y:0};

	this.radius = 3;
	this.speed = 8;
	this.fill = "red";
	this.comets = comets;

	_create.call(this);
	_onFrame.call(this);
}

module.exports = Laser;

},{"../svg/SVGHelper":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/svg/SVGHelper.js","../util/Util":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/Util.js"}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/svg/SVGHelper.js":[function(require,module,exports){
var namespace = "http://www.w3.org/2000/svg";

function SVGHelper(){

}

SVGHelper.createElement = function(el){
	return document.createElementNS(namespace, el);
};

module.exports = SVGHelper;

},{}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/Util.js":[function(require,module,exports){
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

},{}]},{},["./_js/app.js"]);
