

// Define the "class" (function namespace)
function MoodSpaces(db) {
	this.db = db;
};
// Define the class members
MoodSpaces.prototype = {
	MOODS: [{
			label: 'fear',
			color: '#007B33'
		}, {
			label: 'surprise',			
			color: '#0081AB'
		}, {
			label: 'sadness',
			color: '#1F6CAD'
		},{
			label: 'disgust',
			color: '#7B4EA3'
		}, {
			label: 'anger',
			color: '#DC0047'
		}, {
			label: 'anticipation',
			color: '#E87200'
		}, {
			label: 'joy',
			color: '#EDC500'
		}, {
			label: 'trust',
			color: '#7BBD0D'
		}]
};

Number.prototype.sin = function(angle) {
	return Math.round(this * Math.sin(angle));
};

Number.prototype.cos = function(angle) {
	return Math.round(this * Math.cos(angle));
};

var app = new MoodSpaces();
$("#new").live('pageshow', function(event) {
	var wheel = $('#plutchik');
	var maxSize = Math.min(wheel.parent().width(), wheel.parent().height());
	wheel.css('width', maxSize + 'px');
	wheel.css('height', maxSize + 'px');
	
	
	
	if(wheel.children().length == 0) {
		var moods = app.MOODS;
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
											(60).sin((j + 0.5) * unitAngle)
									),
				'font-size': 10,
				'font-family': 'sans-serif',
				'text-anchor': 'middle',
				'alignment-baseline': 'middle',
				'fill': '#ffffff'
			}).getElement();
			wheel.append(text);
		}
	}
	var pin = new SVG.Circle({
		'cx': 0,
		'cy': 0,
		'r': 5,
		'fill': "#666666",
		'stroke': "#000000",
		'stroke-width': 2
	}).getElement();
	wheel.append(pin);
	
	pin = $(pin);
	
	var dragging = false;
	pin.bind("vmousedown", function(event){
		dragging = true;
		console.log('start dragging');
	});
	
	pin.bind("vmousemove", function (event) {
		if(dragging) {
			console.log(event);
		}
	});
	
	pin.bind("vmouseup", function(event){
		dragging = false;
		console.log('stop dragging');
	});
});
