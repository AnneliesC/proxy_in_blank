function Util(){

}

Util.randomStartPointTop = function(bounds){
	bounds.border = bounds.border || 0;
	return {
		x: bounds.border + Math.round(Math.random() * (bounds.width-(bounds.border*2))),
		y: -50
	};
};

Util.randomStatic = function(static){
	var rand = Math.round(Math.random()*(static.length-1));
	return static[rand];
};

Util.distanceBetweenPoints = function(position1, position2){

  var xs = position2.x - position1.x;
  xs = xs * xs;

  var ys = position2.y - position1.y;
  ys = ys * ys;

  return Math.sqrt(xs + ys);

};

function _normalize( value, minimum, maximum )
{
    return (value - minimum) / (maximum - minimum);
}

function _interpolate( normValue, minimum, maximum )
{
    return minimum + (maximum - minimum) * normValue;
}

Util.map = function( value, min1, max1, min2, max2 )
{
    return _interpolate( _normalize( value, min1, max1 ), min2, max2 );
};

module.exports = Util;
