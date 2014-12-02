(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./_js/app.js":[function(require,module,exports){
/* jshint newcap: false */
/* globals Notification:true*/

require("./modules/util/Polyfill");

var chkNotifiable = document.getElementById("chkNotifiable");
var btnAgain = document.getElementById("btnagain");
/* CLICKHANDLERS */

function _chkNotifiableClickHandler(event){
	if (!event.srcElement.checked){
		return;
	}
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

function _btnRetryClickHandler(event){
	//event.preventDefault();
	window.location = "/";
}

/* INIT */

function init(){
	if (document.getElementById('chkNotifiable')) {
		chkNotifiable.addEventListener("click", _chkNotifiableClickHandler);
	}
	if (document.getElementById('btnagain')) {
		btnAgain.addEventListener("click", _btnRetryClickHandler);
	}
}

init();

},{"./modules/util/Polyfill":"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/Polyfill.js"}],"/Users/zoevankuyk/Documents/Devine/2014 - 2015/RMDIII/RMDIII_OPDRACHT/code/proxy_in_blank/_js/modules/util/Polyfill.js":[function(require,module,exports){
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

},{}]},{},["./_js/app.js"]);
