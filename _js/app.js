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
