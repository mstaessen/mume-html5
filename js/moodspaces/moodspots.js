var MSMoodSpotsView = MSView.extend({
	init: function(app) {
        app.log("MSMoodSpotsView::init");
        this._super(app, 'moodspots');
        
        this.content = $("#moodspots > [data-role=content]");
		this.moods = [];
		this.bigMoods = app.newMoodView.getMoods();
		for(var i=0; i< this.bigMoods.length; i++ ){
			this.moods[i] = this.bigMoods[i].label;
		}
		this.scoreMultiplier = app.scoreMultiplier;
		this.maxRadius = app.maxRadius;
    },
    load: function() {
        this.app.log("MSMoodSpotsView::load");
        this._super();
		var self = this;
		
		self.content.append('<div id="map_canvas" style="width:100%;height:50%"></div>')
		// Also works with: var yourStartLatLng = '59.3426606750, 18.0736160278';
        var yourStartLatLng = new google.maps.LatLng(50.883, 4.7);
        $('#map_canvas').gmap({'center': yourStartLatLng, 'zoom':10});
		
		this.app.database.iterateMoodSpots(
			//iter
			function(spot){
				var spotPosition = new google.maps.LatLng(spot.latitude, spot.longitude);
				$('#map_canvas').gmap('addMarker', 
					{
					'position': spotPosition, 
					'draggable': true, 
					'bounds': false
					}, function(map, marker) {
						//self.findLocation(marker.getPosition(), marker);
				});
			},
			//onSuccess
			function(){
			}, 
			//onError
			self.error
		);
		
		this.app.database.getAllMoodSpots(
			function(spots) {
				if(spots.length === 0)
					return;
				self.calcSpotMoods(spots);
			},
			self.error,
			function(spot){
				return spot;
			}
		);
    },
    unload: function() {
        this.app.log("MSMoodSpotsView::unload");
		$('#map_canvas').remove();
        this._super();
    },
	calcSpotMoods: function(spots) {
		var self = this;
		self.app.log("MSMoodSpotsView::calcSpotMoods");
		
		self.data = [[]];
		for(var i = 0; i < spots.length; i++) {
			self.data[i] = [];
			for(var j = 0; j < self.moods.length; j++){
				self.data[i][j] = 0;
			}
		}
		self.fillData(self.data, spots);
	},
	fillData: function(data, spots){
		var self = this;
		var spotIDs = [];
		for(var n=0; n<spots.length; n++){
			spotIDs[n] = spots[n].spotid;
		}
		self.app.database.getAllMoodEntries(
			//onSuccess
			function(entries){
				self.app.log("total moodentries in the database: " + entries.length);
				for(var i=0; i<entries.length; i++){
					var curEntry = entries[i];
					//calculate the correct selectedMoods in terms of the names of the moods.
					var selectedMoodName = self.calcSelectedMoodName(curEntry.phi);
					var spotIndex = spotIDs.indexOf(curEntry.spot);
					var valueToAdd = Math.floor(self.scoreMultiplier*curEntry.r);
					data[spotIndex][self.moods.indexOf(selectedMoodName)] += valueToAdd;
				}
				for(var k = 0; k < data.length; k++) {
					var currentSpotData = data[k];
					var currentSpot = spots[k];
					if(currentSpot.active !== 'TRUE') {
						return;
					}
					var sortedIndex = self.sortAndAddToList(currentSpotData, currentSpot);
					//Now data[k][sortedIndex[0]] is the highest score and spotIDs[sortedIndex[0]] is the corresponding spot ID.
					var maxScore = currentSpotData[sortedIndex[0]];
					if(maxScore == 0){
						return;
					}
					var spotPosition = new google.maps.LatLng(currentSpot.latitude, currentSpot.longitude);
					//Add the sorted data to the list:
					//Retrieve the list, data is created using self.moods, so we can use this.
					for(var m=0; m<self.moods.length; m++){
						var currentIndex = sortedIndex[m];
						var currentScore = currentSpotData[currentIndex];
						var currentMood = self.moods[currentIndex];
						self.app.log('id: ' + currentSpot.spotid
							+ ' name: ' + currentSpot.name 
							+ ' mood: ' + currentMood
							+ ' score: ' + currentSpotData[currentIndex]);
							
						var radius = self.maxRadius*currentScore/maxScore;
						self.app.log('radius = ' + radius);
						$('#map_canvas').gmap('addShape', 'Circle', { 
							'strokeWeight': 0, 
							'fillColor': self.bigMoods[currentIndex].color, 
							'fillOpacity': 0.8, 
							'center': spotPosition, 
							'radius': radius, 
							'clickable': false 
						});
					}
				}
			},
			//onError
			self.error
		);
	},
	calcSelectedMoodName: function(selectionPhi){
		var self = this;
		var numberOfMoods = self.moods.length;
		var stepAngle = 2*Math.PI/numberOfMoods;
		//Convert phi that goes (from 0 to -Pi and from Pi to 0) to 0 to 2PI 
		var angle = 0;
		if(selectionPhi < 0){
			angle = -selectionPhi;
		} else{
			angle = -selectionPhi + (2*Math.PI);
		}
		//Vermenigvuldig de hoek met numberOfMoods/(2*Math.PI) en check dan welke index het heeft = mood
		var area = Math.floor((angle*numberOfMoods)/(2*Math.PI));
		return self.moods[area];
	},
	sortAndAddToList: function(scores, spot){
		//Create an array that only contains the numbers from 0 to scores.length-1.
		var index = [];
		for(var i= scores.length; i>0; i--){
			index.push(scores.length-i);
		}
		//Create a compare function to sort the index array based on the corresponding scores value.
		var comparator = function(x,y) {
			var score_x = scores[x];
			var score_y = scores[y];
			if (typeof score_x != 'number' || isNaN(score_x)) score_x = -Infinity;
			if (typeof score_y != 'number' || isNaN(score_y)) score_y = -Infinity;

			if (score_x < score_y) return 1;
			if (score_y < score_x) return -1;
			return 0;
		};
		return index.sort(comparator);
	}
});