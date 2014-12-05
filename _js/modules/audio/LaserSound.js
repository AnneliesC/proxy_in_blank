function LaserSound(stream){
	console.log("[LaserSound]");
}

LaserSound.playLaserSound = function(){
	var sound = $('audio')[0];
	sound.play();
};

module.exports = LaserSound;
