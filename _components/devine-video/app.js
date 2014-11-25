/* jshint newcap: false */

function errorHandler(error) {
	console.log("video error");
}

function addStream(stream) {
	this.$.container.querySelector("video").setAttribute("src", window.URL.createObjectURL(stream));
	this.fire("playingstream", {stream: stream});
}

function checkUserMedia(){
	if(this.stream){
		addStream.call(this,this.stream);
	}else{
		this.removeStream();
	}
}

function userMedia() {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
													navigator.mozGetUserMedia || navigator.msGetUserMedia;
	navigator.getUserMedia({video: true, audio: false}, addStream.bind(this), errorHandler.bind(this));
}

Polymer({

	label: "",
	usermedia: false,
	stream: undefined,

	usermediaChanged: function(){
		checkUserMedia.call(this);
	},

	streamChanged: function(){
		checkUserMedia.call(this);
	},

	ready: function(){
		if(this.usermedia){
			userMedia.call(this);
		}else if(this.stream){
			this.addStream(this.stream);
		}
	},

	removeStream: function() {
		this.$.container.querySelector("video").setAttribute("src", "");
	},

});
