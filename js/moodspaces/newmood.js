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
    
        // create the wheel if it hasn't been created yet
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
    
        // create the pin
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
        
        // install the locations to the <select> for locations
        var locationSelect = $('#newmood-location');
        this.app.database.iterateMoodSpots(
            function(spot) {
                locationSelect.append('<option value="' + spot.spotId + '">' + spot.name + '</option>');
            }
        , function() {}, this.app.log);
        locationSelect.selectmenu('refresh', true);
        
        // install the locations to the <select> for activity
        var activitySelect = $('#newmood-activity');
        this.app.database.iterateMoodActivities(
            function(activity) {
                activitySelect.append('<option value="' + activity.activityId + '">' + activity.name + '</option>');
            }
        , function() {}, this.app.log);
        activitySelect.selectmenu('refresh', true);
        
        // install the listeners to cancel and submit
        $('#newmood-cancel').click(function() {
            _this.cancel();
        });
        $('#newmood-submit').click(function() {
            _this.submit();
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
    
        // remove all listeners from the wheel
        this.wheel.off();
        
        /*
         * The following actions are taken here, because if they were done in the following load,
         * the user will see a flash with his/her previous selection, which we don't want of course.
         */
        
        // clear the location select and re-init with placeholder
        var locationSelect = $('#newmood-location');
        locationSelect.empty();
        locationSelect.append('<option value="" disabled="disabled" selected="selected">Location</option>');
        locationSelect.selectmenu('refresh', true);
        
        // clear the activity select and re-init with placeholder
        var activitySelect = $('#newmood-activity');
        activitySelect.empty();
        activitySelect.append('<option value="" disabled="disabled" selected="selected">Activity</option>');
        activitySelect.selectmenu('refresh', true);
        
        // reset the selected location
        this.selectedMood.r = this.selectedMood.phi = 0;
        
        // remove the listeners on cancel and submit
        $('#newmood-cancel').off();
        $('#newmood-submit').off();
    },
    
    cancel: function() {
        this.app.changePage('home');
    },
    submit: function() {
        var selectedMood = this.selectedMood;
        var selectedActivity = $('#newmood-activity')[0].value;
        var selectedLocation = $('#newmood-location')[0].value;
        
        // TODO people!!!
        
        var self = this;
        
        this.app.database.addMoodEntry(
            // the object to add
            {
                timestamp: +new Date, // Date.now is not implemented on some browsers...
                spot: selectedLocation,
                activity: selectedActivity,
                selections: [selectedMood],
                people: []
            },
            // onSuccess
            function() {
                self.app.changePage('home');
            },
            // onError
            this.error
        );
    },
    error: function(error) {
        // TODO general error function
        console.error(error);
    }
});