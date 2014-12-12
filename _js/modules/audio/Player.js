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
