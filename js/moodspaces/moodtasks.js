var MSMoodTasksView = MSView.extend({
	init: function(app) {
        app.log("MSMoodTasksView::init");
        this._super(app, 'moodtasks');
        
        this.content = $("#moodtasks > [data-role=content]");
		this.moods = [];
		var bigMoods = app.newMoodView.getMoods();
		for(var i=0; i< bigMoods.length; i++ ){
			this.moods[i] = bigMoods[i].label;
		}
		this.scoreMultiplier = app.scoreMultiplier;
    },
    load: function() {
        this.app.log("MSMoodTasksView::load");
        this._super();
		var self = this;
		
		
		this.app.database.getAllMoodActivities(
			function(activities) {
				self.calcActivityMoods(activities);
			},
			self.error,
			function(activity){
				return activity;
			}
		);
    },
    unload: function() {
        this.app.log("MSMoodTasksView::unload");
        this._super();
		for(var i=0; i<this.moods.length; i++){
			$('#' + this.moods[i] + 'list').empty().listview('refresh');
		}
    },
	calcActivityMoods: function(activities) {
		var self = this;
		self.app.log("MSMoodTasksView::calcActivityMoods");
		
		self.data = [[]];
		for(var i = 0; i < self.moods.length; i++) {
			self.data[i] = [];
			for(var j = 0; j < activities.length; j++){
				self.data[i][j] = 0;
			}
		}
		self.fillData(self.data, activities);
	},
	fillData: function(data, activities){
		var self = this;
		var activityIDs = [];
		for(var n=0; n<activities.length; n++){
			activityIDs[n] = activities[n].activityid;
		}
		self.app.database.getAllMoodEntries(
			//onSuccess
			function(entries){
				self.app.log("total moodentries in the database: " + entries.length);
				for(var i=0; i<entries.length; i++){
					var curEntry = entries[i];
					//calculate the correct selectedMoods in terms of the names of the moods.
					var selectedMoodName = self.calcSelectedMoodName(curEntry.phi);
					data[self.moods.indexOf(selectedMoodName)][activityIDs.indexOf(curEntry.activity)] += Math.floor(self.scoreMultiplier*curEntry.r);
				}
				for(var k = 0; k < data.length; k++) {
					var currentMoodData = data[k];
					var currentMood = self.moods[k];
					var sortedIndex = self.sortAndAddToList(currentMoodData, currentMood);
					//Now data[k][sortedIndex[0]] is the highest score and activityIDs[sortedIndex[0]] is the corresponding activity ID.
					
					//Add the sorted data to the list:
					//Retrieve the list, data is created using self.moods, so we can use this.
					var list = $('#' + currentMood + 'list');
					for(var m=0; m<activityIDs.length; m++){
						var currentIndex = sortedIndex[m];
						var currentScore = currentMoodData[currentIndex];
						var currentActivity = activities[currentIndex];
						if(currentActivity.active !== 'TRUE') {
							return;
						}
						list.listview();
						list.append('<li data-elem-id="' + currentActivity.activityid + '">'
								+ currentActivity.name 
								+ '<span class="ui-li-count">' + currentMoodData[currentIndex] + '</span>'
								+ '</li>'
							).listview('refresh');
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
	sortAndAddToList: function(scores, mood){
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
