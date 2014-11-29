var SVGHelper = require("../svg/SVGHelper");
var Util = require("../util/Util");

function _onFrame(){
	if(this.move){

		this.position.y = this.position.y - this.speed;
		if(this.position.y < -this.radius){
			bean.fire(this,"top");
		}

		for(var i=0;i<this.comets.length;i++){
			var distance = Util.distanceBetweenPoints(this.position,this.comets[i].position);

			if(distance < this.comets[i].radius+this.radius){
				this.hit = this.comets[i];
				bean.fire(this,"hit");
			}
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
	this.element.setAttribute("class","red");
}

function Laser(position,comets){
	this.position = position || {x:0,y:0};

	this.radius = 3;
	this.speed = 8;
	this.fill = "red";
	this.comets = comets;

	_create.call(this);
	_onFrame.call(this);
}

module.exports = Laser;
