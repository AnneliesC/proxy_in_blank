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
