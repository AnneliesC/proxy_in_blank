/* jshint newcap: false */
/* globals Notification:true*/

require("./modules/util/Polyfill");

var chkNotifiable = document.getElementById("chkNotifiable");

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

/* INIT */

function init(){
	chkNotifiable.addEventListener("click", _chkNotifiableClickHandler);
}

init();
