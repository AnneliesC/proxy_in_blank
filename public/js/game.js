(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./_js/game.js":[function(require,module,exports){
/* jshint newcap: false */
/* globals AudioContext:true*/

require("./modules/util/Polyfill");

var Util = require("./modules/util/Util");
var Comet = require("./modules/gameElements/Comet");
var Laser = require("./modules/gameElements/Laser");
var Headtracker = require("./modules/video/Headtracker");
var DetectClapping = require("./modules/audio/DetectClapping");
var BufferLoader = require('./modules/audio/BufferLoader');
var Player = require('./modules/audio/Player');
var sets = require('./modules/audio/data_sound').sets;
require("./modules/notifications/Notif");

var btnBack = document.getElementById("btnback");
var btnInfo = document.getElementById("btninfo");
var btnAgain = document.getElementById("btnagain");

var lblScore = document.getElementById("lblscore");
var lblTime = document.getElementById("lbltime");
var lblCountdown = document.getElementById("countdown");
var lblTips = document.getElementById("tips");
var svg = document.querySelector("svg");
var spaceship = document.getElementById("rocket");
var highscores = document.getElementById("highscores");

var bounds,comets,lasers;
var countdownTime = 5;
var gamePaused = false;
var countdownInterval,timerInterval,cometsInterval;
var score,time;
var headtracker;
var arrAudio;
var player;

/* API */

function _httpGet(url)
{
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function _updateLabels(){
	var minutes = Math.floor(time/60);
	var seconds = time - minutes * 60;
	if(minutes.toString().length === 1){minutes = "0"+minutes;}
	if(seconds.toString().length === 1){seconds = "0"+seconds;}

	lblScore.innerHTML = score;
	lblTime.innerHTML = minutes+":"+seconds;
}

function _timer(){
	time = time + 1;
	score = score + 2;
	_updateLabels();
}

function _createComet(){
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

function _createLaser(){
	if(gamePaused){ return; }
	var laser = new Laser({x:Headtracker.getSpaceshipPosition(),y:window.innerHeight-210},comets);
	laser.target = {x:laser.position.x,y:50};
	laser.move = true;

	bean.on(laser,"top",function(){
		svg.removeChild(laser.element);
		lasers.splice(lasers.indexOf(laser),1);
	});

	bean.on(laser,"hit",function(){
		player.play(arrAudio[1]);
		svg.removeChild(laser.hit.element);
		comets.splice(comets.indexOf(laser.hit),1);
		svg.removeChild(laser.element);
		lasers.splice(lasers.indexOf(laser),1);
		score = score + 5;
		_updateLabels();
	});

	svg.appendChild(laser.element);
	player.play(arrAudio[0]);
	lasers.push(laser);
}

/* TIMERS */

function _setTimers(){
	cometsInterval = setInterval(_createComet, 2000);
	timerInterval = setInterval(_timer, 1000);
}

/* PAUSE - PLAY */

function _showHighscores(){
	highscores.setAttribute("class","show");
}

function _pauseGame(){
	gamePaused = true;
	Headtracker.stopHeadtracking();
	clearInterval(timerInterval);
	clearInterval(cometsInterval);

	for(var i=0;i<comets.length;i++){
		comets[i].move = false;
	}
}

function _resumeGame(){
	gamePaused = false;
	Headtracker.startHeadtracking();
	_setTimers();

	for(var i=0;i<comets.length;i++){
		comets[i].move = true;
	}
}

/* GAME LOGIC  */

function _resetGameSettings(){
	comets = [];
	lasers = [];
	score = 0;
	time = 0;
	lblScore.innerHTML = "0";
	lblTime.innerHTML = "00:00";
}

function _gameOver(){
	var users = $.parseJSON(_httpGet("./api/users"));
	var usersWithHigherScores = _.filter(users, function(user){
		return user.points >= score;
	});

	if(usersWithHigherScores.length <= 4){
		document.getElementById("noTop5").setAttribute("class","display-none");
	}else{
		document.getElementById("top5").setAttribute("class","display-none");
		document.getElementById("noTop5").setAttribute("class","");
	}

	_pauseGame();
	document.getElementById("points").setAttribute("value",score);
	$(".gainedPoints").text(""+score);
	_showHighscores();
}

function _checkCollision(){
	var xPos = Headtracker.getSpaceshipPosition();

	for(var i=0; i<comets.length;i++){
		var comet = comets[i];
		if( ((comet.position.x + comet.radius > xPos - spaceship.offsetWidth/2) && (comet.position.x - comet.radius < xPos + spaceship.offsetWidth/2)) && comet.position.y - comet.radius > spaceship.offsetTop){
			_gameOver();
			player.play(arrAudio[1]);
		}
	}
}

/* COUNTDOWN - START GAME */

function _btnInfoClickHandler(event){
	event.preventDefault();
	if(gamePaused){
		_resumeGame();
	}else{
		_pauseGame();
	}
}

function _startGame(){
	console.log("[App] init game settings");
	_setTimers();
	gamePaused = false;
	btnInfo.addEventListener("click", _btnInfoClickHandler);
}

function _countdown(){
	countdownTime = countdownTime - 1;
	lblCountdown.innerHTML = countdownTime;
	if(countdownTime < 0){
		clearInterval(countdownInterval);
		document.getElementById("game").removeChild(lblCountdown);
		document.getElementById("game").removeChild(lblTips);
		_startGame();
	}
}

function _startCountDown(){
	_resetGameSettings();
	lblCountdown.innerHTML = countdownTime;
	countdownInterval = setInterval(_countdown, 1000);
}

/* CLICKHANDLERS */

function _btnBackClickHandler(event){
	event.preventDefault();
	window.location = "./";
}

function _btnAgainClickHandler(event){
	event.preventDefault();
	window.location = "./game";
}

/* AUDIO VIDEO STREAM  */

function _getUserMedia(){
	navigator.getUserMedia = (
		navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia);
}

function _userErrorHandler(error){
	console.log("[Game] audio error");
}

function _initStream(stream){

	var detectClapping = new DetectClapping(stream);
	bean.on(detectClapping,"shoot", _createLaser);

	headtracker = new Headtracker(stream,"game");
	Headtracker.startHeadtracking();
	bean.on(headtracker,"moved",_checkCollision);
	if(highscores.getAttribute("class") !== "show"){ _startCountDown(); }
}

function _soundsLoaded(arr){
	console.log("[SOUNDS] sounds loaded");
	arrAudio = arr;
}

/* INIT */

function _init(){

	bounds = {
		width: window.innerWidth,
		height: window.innerHeight,
		border: 10
	};

	_getUserMedia();
	if (navigator.getUserMedia) {
		navigator.getUserMedia({audio: true, video: true}, _initStream, _userErrorHandler);
	}else{
		console.log("[Game] fallback");
	}

	//gamesound
	var context = new AudioContext();
	player = new Player(context);

	var loader = new BufferLoader(context, sets, _soundsLoaded);
	loader.load();

	btnAgain.addEventListener("click", _btnAgainClickHandler);
	btnBack.addEventListener("click", _btnBackClickHandler);
}

_init();

},{"./modules/audio/BufferLoader":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/audio/BufferLoader.js","./modules/audio/DetectClapping":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/audio/DetectClapping.js","./modules/audio/Player":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/audio/Player.js","./modules/audio/data_sound":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/audio/data_sound.json","./modules/gameElements/Comet":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/gameElements/Comet.js","./modules/gameElements/Laser":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/gameElements/Laser.js","./modules/notifications/Notif":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/notifications/Notif.js","./modules/util/Polyfill":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/Polyfill.js","./modules/util/Util":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/Util.js","./modules/video/Headtracker":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/video/Headtracker.js"}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/audio/BufferLoader.js":[function(require,module,exports){
function BufferLoader(context, url, callback) {
	this.context = context;
	this.urlList = url;
	this.onload = callback;
	this.bufferList = [];
	this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url) {
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	console.log(url);

	var loader = this;

	request.onload = function() {
		// Asynchronously decode the audio file data in request.response
		loader.context.decodeAudioData(
			request.response,
			function(buffer) {
				if (!buffer) {
					console.error('error decoding file data: ' + url);
					return;
				}
				loader.bufferList.push(buffer);
				if(++loader.loadCount === loader.urlList.length){
					loader.onload(loader.bufferList);
				}
			},
			function(error) {
				console.error('decodeAudioData error', error);
			}
		);
	};

	request.onerror = function() {
		console.error('BufferLoader: XHR error');
	};

	request.send();
};

BufferLoader.prototype.load = function() {
	for (var i = 0; i < this.urlList.length; ++i){
		this.loadBuffer(this.urlList[i].file);
	}
};

module.exports = BufferLoader;

},{}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/audio/DetectClapping.js":[function(require,module,exports){

var audioContext,analyserNode,javascriptNode,amplitudeArray,audioStream,currentValue;
var sampleSize = 1024;

function _checkForClapping(){
  var minValue = 9999999;
  var maxValue = 0;

  for (var i = 0; i < amplitudeArray.length; i++) {
      var value = amplitudeArray[i] / 256;
      if(value > maxValue){
          maxValue = value;
      }else if(value < minValue){
          minValue = value;
      }
  }

  currentValue = (maxValue-minValue)*1000;
  if (currentValue > 600){
		bean.fire(this,"shoot");
	}
}

function _initAudioContext(){
	console.log("[DetectClapping] initializing Audio");

  try {
    audioContext = new AudioContext();
  } catch(e) {
    console.log('[DetectClapping] Web Audio API is not supported in this browser');
  }
}

function _audioProcess(){
	amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
  analyserNode.getByteTimeDomainData(amplitudeArray);
  requestAnimFrame(_checkForClapping.bind(this));
}

function DetectClapping(stream){
	console.log("[DetectClapping]");

	_initAudioContext();
  var sourceNode = audioContext.createMediaStreamSource(stream);
  audioStream = stream;

  analyserNode   = audioContext.createAnalyser();
  javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);
  amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);

  javascriptNode.onaudioprocess = _audioProcess.bind(this);

  sourceNode.connect(analyserNode);
  analyserNode.connect(javascriptNode);
  javascriptNode.connect(audioContext.destination);
}

module.exports = DetectClapping;

},{}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/audio/Player.js":[function(require,module,exports){
function Player(context){
	this.context = context;
}

Player.prototype.play = function(sound){
	var source = this.context.createBufferSource();
	source.buffer = sound;
	source.connect(this.context.destination);
	source.start(0);
};

module.exports = Player;

},{}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/audio/data_sound.json":[function(require,module,exports){
module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports={
	"sets": [
			{
				"name": "LASER",
				"file": "sound/laser.wav"
			},
			{
				"name": "EXPLOSION",
				"file": "sound/explosion.wav"
			}
	]
}

},{}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/gameElements/Comet.js":[function(require,module,exports){
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
	this.element.setAttribute("fill", this.fill);
	this.element.setAttribute("stroke", "#843322");
	this.element.setAttribute('stroke-width', 2);
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

},{"../svg/SVGHelper":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/svg/SVGHelper.js","../util/Util":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/Util.js"}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/notifications/Notif.js":[function(require,module,exports){
var socket;
var server = "http://localhost:3000";

function _initNotification(){
	console.log("[Notification] init notification");
	Notification.requestPermission(function (status) {
		if (Notification.permission !== status) {
			Notification.permission = status;
		}
		if (Notification.permission === 'granted') {
			console.log("granted");

		} else {
			console.log("not granted");
		}
	});
}

function _message(tekst){
	console.log("[Notification] notification: ", tekst);

	_initNotification();
	var ms = 4000;

	var n = new Notification("Nieuwe top 5!", {
		body: tekst + ' staat nu in de top 5!',
		icon: 'images/notification.png'
	});
	n.onshow = function (){
		setTimeout(n.close.bind(n), ms);
	};
}

function _initSocket(){
	socket = io(server);
	socket.on('message', _message);
}

module.exports = (function(){
	socket = socket;
	_initSocket();
	_initNotification();
})();


},{}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/svg/SVGHelper.js":[function(require,module,exports){
var namespace = "http://www.w3.org/2000/svg";

function SVGHelper(){

}

SVGHelper.createElement = function(el){
	return document.createElementNS(namespace, el);
};

module.exports = SVGHelper;

},{}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/Polyfill.js":[function(require,module,exports){
module.exports = (function(){
	window.requestAnimFrame = require('./RequestAnimationFrame');
	window.requestAudio = require('./RequestAudio');
})();

},{"./RequestAnimationFrame":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/RequestAnimationFrame.js","./RequestAudio":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/RequestAudio.js"}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/RequestAnimationFrame.js":[function(require,module,exports){
module.exports = (function(){
	return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element){window.setTimeout(callback, 1000 / 60); };
})();

},{}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/RequestAudio.js":[function(require,module,exports){
module.exports = (function(){
  return  window.AudioContext || window.webkitAudioContext  || window.mozAudioContext;
})();

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

},{}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/video/Headtracker.js":[function(require,module,exports){
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

htracker = new headtrackr.Tracker({
  ui: false,
  headPosition: false,
  facedetection: 100
});
htracker.init(videoInput, canvasInput);

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
  }else if(event.status in statusMessages){
      messagep = document.getElementById('headtrackerMessage');
  }
},true);

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

Headtracker.startHeadtracking = function(){
	htracker.start();
};

Headtracker.stopHeadtracking = function(){
	htracker.stop();
};

module.exports = Headtracker;

},{"../util/Util":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/Util.js"}]},{},["./_js/game.js"]);
