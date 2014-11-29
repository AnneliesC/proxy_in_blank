var SVGHelper = require("../svg/SVGHelper");
var Util = require("../util/Util");

function Comet(position,type){
	this.position = position || {x:0,y:0};
	this.type = type || Comet.STATIC;

	var min_speed = 10;
	var max_speed = 40;

	this.radius = 7;
	this.speed = min_speed + Math.round(Math.random()*(max_speed-min_speed));
	this.effect = Util.randomEffect();
	this.fill = this.effect.color;

	_create.call(this);
	_onFrame.call(this);
}

Comet.STATIC = "static";
Comet.MOVING = "moving";

function _onFrame(){
	if(this.move && this.type === Comet.MOVING){
		this.position.x += (this.target.position.x - this.position.x)/this.speed;
		this.position.y += (this.target.position.y - this.position.y)/this.speed;

		var distance = Util.distanceBetweenPoints(this.position,this.target.position);

		if(distance < 5){
			bean.fire(this,"hit");
		}

		this.element.setAttribute("cx",this.position.x);
		this.element.setAttribute("cy",this.position.y);
	}
	requestAnimationFrame(_onFrame.bind(this));
}

function _create(){
	this.element = SVGHelper.createElement("circle");
	this.element.setAttribute("cx",this.position.x);
	this.element.setAttribute("cy",this.position.y);
	this.element.setAttribute("r",this.radius);
	this.element.setAttribute("fill",this.fill);
}

module.exports = Comet;
