/*********************
 ****  SVG SCOPE  ****
 *********************/
var SVG = {
	NAMESPACE: "http://www.w3.org/2000/svg"
};

/************************************
 ****  SVG COMMON FUNCTIONALITY  ****
 ************************************/

SVG.Common = {
	merge: function() {
		var len = arguments.length;
		if(len > 0) {
			var subject = arguments[0];
			for(var i = 1; i < len; i++) {
				for(var key in arguments[i]) {
	                subject[key] = arguments[i][key];
		        }
			}
			return subject;
		}
		return undefined;
	}
};

/**********************
 ****  SVG SHAPES  **** 
 **********************/

SVG.Shape = function() {
	this.fillStyle = undefined;
	this.strokeStyle = undefined;
	this.strokeWidth = undefined;
};

SVG.Shape.prototype = SVG.Common.merge({}, {
	stroke: function(paint) {
		this.strokeStyle = paint;
		return this;
	},
	setStrokeWidth: function(width) {
		this.strokeWidth = width;
		return this;
	},
	fill: function(paint) {
		this.fillStyle = paint;
		return this;
	}
});

/*********************
 ****  SVG PATHS  ****
 *********************/


SVG.Path = function(){
	this.subpaths = [];
};
SVG.Path.prototype = SVG.Common.merge({}, SVG.Shape.prototype, {
	moveTo: function(x, y) {
		this.subpaths.push('M' + x + ' ' + y);
		return this;
	},
	relativeMoveTo: function (x, y) {
		this.subpaths.push('m' + x + ' ' + y);
		return this;
	},
	lineTo: function(x, y) {
		this.subpaths.push('L' + x + ' ' + y);
		return this;
	},
	relativeLineTo: function(x, y) {
		this.subpaths.push('l' + x + ' ' + y);
		return this;
	},
	horizontalTo: function (x) {
		this.subpaths.push('H' + x + ' ' + y);
		return this;
	},
	relativeHorizontalTo: function (x) {
		this.subpaths.push('h' + x + ' ' + y);
		return this;
	},
	verticalTo: function (x) {
		this.subpaths.push('H' + x + ' ' + y);
		return this;
	},
	relativeVerticalTo: function (x) {
		this.subpaths.push('h' + x + ' ' + y);
		return this;
	},
	curveTo: function(c1x, c1y, c2x, c2y, x, y) {
		this.subpaths.push('C' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + x + ' ' + y);
		return this;
	},
	relativeCurveTo: function(c1x, c1y, c2x, c2y, x, y) {
		this.subpaths.push('c' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + x + ' ' + y);
		return this;
	},
	cubicCurveTo: function(c2x, c2y, x, y) {
		this.subpaths.push('S'+ c2x + ' ' + c2y + ' ' + x + ' ' + y);
		return this;
	},
	relativeCubicCurveTo: function(cx, c2y, x, y) {
		this.subpaths.push('s' + c2x + ' ' + c2y + ' ' + x + ' ' + y);
		return this;
	},
	quadraticCurveTo: function(c1x, c1y, x, y) {
		this.subpaths.push('Q'+ c1x + ' ' + c1y + ' ' + x + ' ' + y);
		return this;
	},
	relativeQuadraticCurveTo: function(c1x, c1y, x, y) {
		this.subpaths.push('q' + c1x + ' ' + c1y + ' ' + x + ' ' + y);
		return this;
	},
	smoothCurveTo: function(x, y) {
		this.subpaths.push('T' + x + ' ' + y);
		return this;
	},
	relativeSmoothCurveTo: function(c1x, c1y, x, y) {
		this.subpaths.push('t' + x + ' ' + y);
		return this;
	},
	arcTo: function(rx, ry, rotation, largeArc, sweep, x, y) {
		this.subpaths.push('A' + rx + ' ' + ry + ' ' + rotation + ' ' + largeArc + ' ' + sweep + ' ' + x + ' ' + y);
		return this;
	},
	relativeArcTo: function(rx, ry, rotation, largeArc, sweep, x, y) {
		this.subpaths.push('a' + rx + ' ' + ry + ' ' + rotation + ' ' + largeArc + ' ' + sweep + ' ' + x + ' ' + y);
		return this;
	},
	close: function() {
		this.subpaths.push('z');
		return this;
	},
	getElement: function () {
		var el = document.createElementNS(SVG.NAMESPACE, "path");
		if(this.subpaths.length > 0) {
			el.setAttributeNS(null, 'd', this.subpaths.join(''));
		}
		
		if(this.fillStyle) {
			el.setAttributeNS(null, 'fill', this.fillStyle);
		}
		
		if(this.strokeStyle) {
			el.setAttributeNS(null, 'stroke', this.strokeStyle);
		}
		
		if(this.strokeWidth) {
			el.setAttributeNS(null, 'stroke-width', this.strokeWidth);
		}

		return el;
	}
});

/*********************
 ****  SVG PAINT  **** 
 *********************/

SVG.Paint = function() {};
SVG.Paint.prototype = SVG.Common.merge({}, {
	constructor: SVG.Paint,
	color: function(hex) {
		return hex;
	},
	gradient: function() {
		
	}
});

/**********************
 ****  SVG CIRCLE  **** 
 **********************/

SVG.Circle = function() {};

/*************************
 ****  SVG RECTANGLE  **** 
 *************************/

SVG.Rectangle = function() {};

/********************
 ****  SVG TEXT  **** 
 ********************/

SVG.Text = function(text, options) {
	this.text = text;
	this.options = options || {}; 
};
SVG.Text.prototype = SVG.Common.merge({}, {
	setText: function(text) {
		this.text = text;
	}, 
	setX: function(x) {
		this.options.x = x;
		return this;
	},
	setY: function(y) {
		this.options.y = y;
		return this;
	},
	setFontFamily: function(fontFamily) {
		this.options["font-family"] = fontFamily;
		return this;
	},
	setFontSize: function(fontSize) {
		this.options["font-size"] = fontSize;
		return this;
	},
	setRotation: function(rotation) {
		this.options.rotate = rotation;
		return this;
	},
	getElement: function() {
		var el = document.createElementNS(SVG.NAMESPACE, "text");
		el.appendChild(document.createTextNode(this.text));
		
		for(var key in this.options) {
			el.setAttributeNS(null, key, this.options[key]);
		}

		
		return el;
	}
});

/*******************************
 ****  SVG TRANSFORMATIONS  ****
 *******************************/

SVG.Transform = function() {
	this.list = [];
};
SVG.Transform.prototype = SVG.Common.merge({}, {
	matrix: function (a, b, c, d, e, f) {
		this.list.push('matrix(' + a + ' ' + b + ' ' + c + ' ' + d + ' ' + e + ' ' + f + ')');
		return this;
	},
	translate: function(x, y) {
		var transform = 'translate(' + x;
		if(y) {
			transform += ' ' + y; 
		}
		transform += ')';
		this.list.push(transform);
		return this;
	},
	scale: function(x, y) {
		var transform = 'scale(' + x;
		if(y) {
			transform += ' ' + y; 
		}
		transform += ')';
		this.list.push(transform);
		return this;
	},
	rotate: function(angle, x, y) {
		var transform = 'rotate(' + angle;
		if(x || y) {
			x = x || 0;
			y = y || 0;
			transform += ' ' + x + ' ' + y; 
		}
		transform += ')';
		this.list.push(transform);
		return this;
	},
	skewX: function(x) {
		this.list.push('skewX(' + a + ')');
		return this;
	},
	skewY: function(y) {
		this.list.push('skewY(' + a + ')');
		return this;
	},
	toString: function() {
		return this.list.join(' ');
	}
});
