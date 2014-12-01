/* jshint newcap: false */

require("./modules/util/Polyfill");

var Util = require("./modules/util/Util");
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


/* GAME LOGIC  */

function updateLabels(){
	var minutes = Math.floor(time/60);
	var seconds = time - minutes * 60;
	if(minutes.toString().length === 1){minutes = "0"+minutes;}
	if(seconds.toString().length === 1){seconds = "0"+seconds;}

	lblScore.innerHTML = score;
	lblTime.innerHTML = minutes+":"+seconds;
}

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

/* DETECT CLAPPING  */

function initAudioContext(){
	console.log("[App] initializing Audio");

  try {
    audioContext = new AudioContext();
  } catch(e) {
    console.log('[App] Web Audio API is not supported in this browser');
  }
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

function initVideo(stream){
	videoInput.setAttribute("src",window.URL.createObjectURL(stream));
	startCountDown();
}

function initVideoAudio(stream){
	initVideo(stream);
	if(page === "game"){
		initAudioContext();
		initAudio(stream);
	}
}

function initWebcam(){
	if (navigator.getUserMedia) {
		navigator.getUserMedia({audio: true, video: true}, initVideoAudio,userErrorHandler);
	} else {
		console.log("[Webcam] fallback");
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

/* CLICKHANDLERS */

function btnstartClickHandler(event){
	event.preventDefault();
	window.location = "./game";
}

function btnInfoClickHandler(event){
	event.preventDefault();
}

/* INIT */

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

init();
