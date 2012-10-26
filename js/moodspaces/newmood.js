Number.prototype.sin = function(angle) {
	return Math.round(this * Math.sin(angle));
};

Number.prototype.cos = function(angle) {
	return Math.round(this * Math.cos(angle));
};

var MSNewMoodView = MSView.extend({
	init: function(app) {
		app.log('MSNewMoodView::init');
		this._super(app);
		
		this.selectedMood = { r: 0, phi: 0};
	
		this.wheel = $('#plutchik');
		this.pin = null;
		this.moods = [{
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
		}];
	},
	load: function() {
		this.app.log('MSNewMoodView::load');
		this._super();
		var wheel = this.wheel;
		var radius = Math.min(wheel.parent().width(), wheel.parent().height()) / 2;
		wheel.css('width', (2 * radius) + 'px');
		wheel.css('height', (2 * radius) + 'px');
	
		if(wheel.children().length == 0) {
			var moods = this.moods;
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
	
		this.pin = new SVG.Circle({
			'cx': 0,
			'cy': 0,
			'r': 5,
			'fill': "#666666",
			'stroke': "#000000",
			'stroke-width': 2
		}).getElement();
		wheel.append(this.pin);
	
		this.pin = $(this.pin);
		
		// a reference for this so the eventlisteners can access it
		var _this = this;
	
		var dragging = false;
		wheel.on("vmousedown", function (event){
			if (event.target.tagName != "circle") {
				return;
			}
		
			dragging = true;
			_this.app.log('start dragging');
			event.stopPropagation();
		});
	
		wheel.on("vmousemove", function (event) {
			if(!dragging) {
				return;
			}
		
			var offset = wheel.offset();
			var x = event.pageX - Math.round(offset.left),
				y = event.pageY - Math.round(offset.top);
			_this.app.log('dragging @ ' + x  + 'x' + y);
		
			x -= radius;
			y -= radius;
			
			var r = Math.sqrt(x * x + y * y) / radius,
				phi = Math.atan2(-y, x);
			_this.app.log('polar coordinates: r=' + r + ' phi=' + phi);
		
			if (r > 1) {
				_this.app.log('outside of circle, ignoring event');
				event.stopPropagation();
				return;
			}
		
			_this.selectedMood.r = r;
			_this.selectedMood.phi = phi;
		
			_this.pin[0].setAttributeNS(null, 'cx', (100 * x / radius));
			_this.pin[0].setAttributeNS(null, 'cy', (100 * y / radius));
		
			event.stopPropagation();
		});
	
		wheel.on("vmouseup", function (event){
			if (!dragging) {
				return;
			}
		
			dragging = false;
			_this.app.log('stop dragging');
			event.stopPropagation();
		});
	},
	unload: function() {
		this.app.log('MSNewMoodView::unload');
		this._super();
		
		// remove the pin
		if (this.pin != null) {
			this.pin.remove();
			this.pin = null;
		}
	
		// remove all listeners
		this.wheel.off();
	}
});