var SVGHelper = require("../svg/SVGHelper");
var Util = require("../util/Util");

function _onFrame(){
	if(this.move){
		this.position.y = this.position.y < this.target.y ? Math.min(this.position.y + this.speed, this.target.y) : Math.max(this.position.y + this.speed, this.target.y);
		var distance = Util.distanceBetweenPoints(this.position,this.target);

		if(distance < 1){
			bean.fire(this,"done");
		}

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

function Comet(position){
	this.position = position || {x:0,y:0};

	var min_speed = 4;
	var max_speed = 7;

	var min_radius = 10;
	var max_radius = 30;

	this.radius = min_radius + Math.round(Math.random()*(max_radius-min_radius));
	this.speed = min_speed + Math.round(Math.random()*(max_speed-min_speed));
	this.fill = "#9e3c29";

	_create.call(this);
	_onFrame.call(this);
}

module.exports = Comet;
