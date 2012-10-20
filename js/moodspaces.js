/*
 * Common
 * 
 * Some modifications to JS prototypes that make using JavaScript a little more fun.
 */
Array.prototype.each = function(func) {
	for(var i = 0, len = this.length; i < len; i++) {
		func(this[i]);
	}
};

Number.prototype.sin = function(angle) {
	return Math.round(this * Math.sin(angle));
};

Number.prototype.cos = function(angle) {
	return Math.round(this * Math.cos(angle));
};

$("#new").live('pageshow', function(event) {
	var moods = [{
			label: 'terror',
			color: '#007B33'
		}, {
			label: 'amazement',			
			color: '#0081AB'
		}, {
			label: 'grief',
			color: '#1F6CAD'
		},{
			label: 'loathing',
			color: '#7B4EA3'
		}, {
			label: 'rage',
			color: '#DC0047'
		}, {
			label: 'vigilance',
			color: '#E87200'
		}, {
			label: 'ecstacy',
			color: '#EDC500'
		}, {
			label: 'admiration',
			color: '#7BBD0D'
		}];
	var wheel = $('#plutchik');
	for(var j = 0; j < moods.length; j++) {
		var unitAngle = 2 * Math.PI / moods.length;
		var path = new SVG.Path({
			'd': new SVG.PathData()
						 .moveTo(0, 0)
				         .lineTo((100).cos(j * unitAngle), (100).sin(j * unitAngle))
				         .arcTo(100, 100, 0, 0, 1, (100).cos((j + 1) * unitAngle), (100).sin((j + 1) * unitAngle))
				         .close(),
			'fill': moods[j].color
		}).getElement();
		wheel.append(path);
		var text = new SVG.Text(moods[j].label, {
			'x': (60).cos((j + 0.5) * unitAngle),
			'y': (60).sin((j + 0.5) * unitAngle),
			'transform': new SVG.Transformation()
								.rotate(
									(Math.PI / moods.length * (2 * ((j + 2) % (moods.length / 2)) + 1) - Math.PI / 2) * 180 / Math.PI,
									(60).cos((j + 0.5) * unitAngle),
									(60).sin((j + 0.5) * unitAngle)),
			'font-size': 10,
			'font-family': 'sans-serif',
			'text-anchor': 'middle',
			'alignment-baseline': 'middle',
			'fill': '#ffffff'
		}).getElement();
		wheel.append(text);
	}
});
