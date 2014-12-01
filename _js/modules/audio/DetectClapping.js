
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
