/*
 * This is a basic JS library for SVG creation and manipulation.
 */

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
	/**
	 * Hash merge(Hash...)
	 * Merges hashes. The next hash overrides keys in the previous one. 
	 * The first Hash will be modified. All other supplied hashes are merged into this one. 
	 */
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

SVG.Shape = function(options) {
	this.options = options || {};
};
SVG.Shape.prototype = SVG.Common.merge({}, {
	constructor: SVG.Shape,
	/**
	 * SVG.Shape stroke(paint)
	 * Sets the stroke style of this shape. 
	 */
	stroke: function(paint) {
		this.options['stroke'] = paint;
		return this;
	},
	/**
	 * SVG.Shape strokeWidth(width)
	 * Sets the stroke width of this shape.
	 */
	setStrokeWidth: function(width) {
		this.options['stroke-width'] = width;
		return this;
	},
	/**
	 * SVG.Shape fill(paint)
	 * Sets the fill style of this shape.
	 */
	fill: function(paint) {
		this.options['fill'] = paint;
		return this;
	},
	/**
	 * SVG.Shape setX(x)
	 * Sets the x coordinate of this shape.
	 */
	setX: function(x) {
		this.options.x = x;
		return this;
	},
	/**
	 * SVG.Shape setY(y)
	 * Sets the y coordinate of this shape.
	 */
	setY: function(y) {
		this.options.y = y;
		return this;
	},
	/**
	 * SVGElement getElement()
	 * Creates a XML Element of this shape.
	 */
	getElement: function() {
		var el = document.createElementNS(SVG.NAMESPACE, this.constructor.prototype.tagName);
		
		for(var key in this.options) {
			el.setAttributeNS(null, key, this.options[key]);
		}

		return el;
	}
});

/*********************
 ****  SVG PATHS  ****
 *********************/

SVG.Path = function(options) {
	this.options = options || {};
};
SVG.Path.prototype = SVG.Common.merge({}, SVG.Shape.prototype, {
	constructor: SVG.Path,
	tagName: 'path'
});

/*************************
 ****  SVG PATH DATA  ****
 *************************/

SVG.PathData = function(){
	this.data = [];
};
SVG.PathData.prototype = SVG.Common.merge({}, {
	constructor: SVG.PathData,
	/**
	 * SVG.PathData moveTo(x, y)
	 * Sets the current position to (x,y) (absolute coordinates)
	 */
	moveTo: function(x, y) {
		this.data.push('M' + x + ' ' + y);
		return this;
	},
	/**
	 * SVG.PathData moveToRelative(x, y)
	 * Sets the current position to (x,y) (relative coordinates)
	 */
	MoveToRelative: function (x, y) {
		this.data.push('m' + x + ' ' + y);
		return this;
	},
	/**
	 * SVG.PathData lineTo(x, y)
	 * Draws a line from the current position to (x,y) (absolute coordinates)
	 */
	lineTo: function(x, y) {
		this.data.push('L' + x + ' ' + y);
		return this;
	},
	/**
	 * SVG.PathData lineToRelative(x, y)
	 * Draws a line from the current position to (x,y) (relative coordinates)
	 */
	lineToRelative: function(x, y) {
		this.data.push('l' + x + ' ' + y);
		return this;
	},
	/**
	 * SVG.PathData horizontalTo(x, y)
	 * Draws a horizontal line from the current position to (x,y) (absolute coordinates)
	 */
	horizontalTo: function (x) {
		this.data.push('H' + x);
		return this;
	},
	/**
	 * SVG.PathData horizontalToRelative(x)
	 * Draws a horizontal line from the current position to (x,y) (relative coordinates)
	 */
	horizontalToRelative: function (x) {
		this.data.push('h' + x);
		return this;
	},
	/**
	 * SVG.PathData verticalTo(x, y)
	 * Draws a vertical line from the current position to (x,y) (absolute coordinates)
	 */
	verticalTo: function (y) {
		this.data.push('V' + y);
		return this;
	},
	/**
	 * SVG.PathData verticalToRelative(x)
	 * Draws a vertical line from the current position to (x,y) (relative coordinates)
	 */
	verticalToRelative: function (y) {
		this.data.push('v' + y);
		return this;
	},
	/**
	 * SVG.PathData curveTo(c1x, c1y, c2x, c2y, x, y)
	 * Draws a bezier curve from the current position to (x,y) using
	 * control points (c1x,c1y) and (c2x,c2y) (absolute coordinates)
	 */
	curveTo: function(c1x, c1y, c2x, c2y, x, y) {
		this.data.push('C' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + x + ' ' + y);
		return this;
	},
	/**
	 * SVG.PathData curveToRelative(c1x, c1y, c2x, c2y, x, y)
	 * Draws a bezier curve from the current position to (x,y) using
	 * control points (c1x,c1y) and (c2x,c2y) (relative coordinates)
	 */
	curveToRelative: function(c1x, c1y, c2x, c2y, x, y) {
		this.data.push('c' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + x + ' ' + y);
		return this;
	},
	/**
	 * SVG.PathData cubicCurveTo(c2x, c2y, x, y)
	 * Draws a cubic bezier curve from the current position to (x,y) using
	 * control point (c2x,c2y) (absolute coordinates)
	 */
	cubicCurveTo: function(c2x, c2y, x, y) {
		this.data.push('S'+ c2x + ' ' + c2y + ' ' + x + ' ' + y);
		return this;
	},
	/**
	 * SVG.PathData cubicCurveToRelative(c2x, c2y, x, y)
	 * Draws a cubic bezier curve from the current position to (x,y) using
	 * control point (c2x,c2y) (relative coordinates)
	 */
	cubicCurveToRelative: function(c2x, c2y, x, y) {
		this.data.push('s' + c2x + ' ' + c2y + ' ' + x + ' ' + y);
		return this;
	},
	/**
	 * SVG.PathData quadraticCurveTo(c1x, c1y, x, y)
	 * Draws a quadratic bezier curve from the current position to (x,y) using
	 * control point (c1x,c1y) (absolute coordinates)
	 */
	quadraticCurveTo: function(c1x, c1y, x, y) {
		this.data.push('Q'+ c1x + ' ' + c1y + ' ' + x + ' ' + y);
		return this;
	},
	/**
	 * SVG.PathData quadraticCurveToRelative(c1x, c1y, x, y)
	 * Draws a quadratic bezier curve from the current position to (x,y) using
	 * control point (c1x,c1y) (relative coordinates)
	 */
	quadraticCurveToRelative: function(c1x, c1y, x, y) {
		this.data.push('q' + c1x + ' ' + c1y + ' ' + x + ' ' + y);
		return this;
	},
	/**
	 * SVG.PathData smoothCurveTo(x, y)
	 * Draws a smooth/freehand bezier curve from the current position to (x,y) using
	 * control point (c1x,c1y) (absolute coordinates)
	 */
	smoothCurveTo: function(x, y) {
		this.data.push('T' + x + ' ' + y);
		return this;
	},
	/**
	 * SVG.PathData smoothCurveToRelative(x, y)
	 * Draws a smooth/freehand bezier curve from the current position to (x,y) using
	 * control point (c1x,c1y) (relative coordinates)
	 */
	smoothCurveToRelative: function(c1x, c1y, x, y) {
		this.data.push('t' + x + ' ' + y);
		return this;
	},
	/**
	 * SVG.PathData arcTo(rx, ry, rotation, largeArc = 0|1, sweep = 0|1, x, y)
	 * Draws an elliptical arc from the current position to (x,y) (absolute coordinates)
	 * with radii rx and ry, rotation is the base rotation of the coordinate system, 
	 * LongArc = 1 means that the longer arc will be drawn, sweep makes the shape either 
	 * convex or concave.
	 */
	arcTo: function(rx, ry, rotation, largeArc, sweep, x, y) {
		this.data.push('A' + rx + ' ' + ry + ' ' + rotation + ' ' + largeArc + ' ' + sweep + ' ' + x + ' ' + y);
		return this;
	},
	/**
	 * SVG.PathData arcToRelative(rx, ry, rotation, largeArc = 0|1, sweep = 0|1, x, y)
	 * Draws an elliptical arc from the current position to (x,y) (relative coordinates)
	 * with radii rx and ry, rotation is the base rotation of the coordinate system, 
	 * LongArc = 1 means that the longer arc will be drawn, sweep makes the shape either 
	 * convex or concave.
	 */
	arcToRelative: function(rx, ry, rotation, largeArc, sweep, x, y) {
		this.data.push('a' + rx + ' ' + ry + ' ' + rotation + ' ' + largeArc + ' ' + sweep + ' ' + x + ' ' + y);
		return this;
	},
	/**
	 * SVG.PathData close()
	 * Closes the path, i.e. draws a line from the current position to the initial position
	 */
	close: function() {
		this.data.push('z');
		return this;
	},
	/**
	 * String toString()
	 * Returns the data as correctly formatted SVG path data
	 */
	toString: function () {
		return this.data.join('');
	}
});

/**********************
 ****  SVG CIRCLE  **** 
 **********************/

SVG.Circle = function(options) {
	this.options = options || {};
};
SVG.Circle.prototype = SVG.Common.merge({}, SVG.Shape.prototype, {
	constructor: SVG.Circle,
	tagName: 'circle'
	/* TODO */
});


/*************************
 ****  SVG RECTANGLE  **** 
 *************************/

SVG.Rectangle = function() {};
SVG.Rectangle.prototype = SVG.Common.merge({}, SVG.Shape.prototype, {
	constructor: SVG.Rectangle,
	tagName: 'rect'
	/* TODO */
});

/********************
 ****  SVG TEXT  **** 
 ********************/

SVG.Text = function(text, options) {
	this.text = text;
	this.options = options || {}; 
};
SVG.Text.prototype = SVG.Common.merge({}, SVG.Shape.prototype, {
	constructor: SVG.Text,
	tagName: 'text',
	setText: function(text) {
		this.text = text;
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
		el = SVG.Shape.prototype.getElement.apply(this);
		el.appendChild(document.createTextNode(this.text));
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

/*******************************
 ****  SVG TRANSFORMATIONS  ****
 *******************************/

SVG.Transformation = function() {
	this.list = [];
};
SVG.Transformation.prototype = SVG.Common.merge({}, {
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
