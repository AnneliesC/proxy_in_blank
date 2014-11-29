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
