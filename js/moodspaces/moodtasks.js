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
    },
    load: function() {
        this.app.log("MSMoodTasksView::load");
        this._super();
		
		var self = this;
		
		for(var j = 0; j < self.moods.length; j++) {
			self.initList(self.moods[j]);
		}
		
		this.app.database.getAllMoodActivitiesNames(
			function(names) {
				self.calcActivityMoods(names);
			},
			self.error
		);
		//self.calcActivityMoods(moods);
    },
    unload: function() {
        this.app.log("MSMoodTasksView::unload");
        this._super();
    },
	calcActivityMoods: function(names) {
		var self = this;
		self.app.log("MSMoodTasksView::calcActivityMoods");
		
		var data = [[]];
		for(var i = 0; i < self.moods.length; i++) {
			data[i] = [];
			for(var j = 0; j < names.length; j++){
				data[i][j] = 0;
			}
		}
		
		/*for(var i = 0; i < data.length; i++) {
			for(var j = 0; j < data[i].length; j++){
				this.app.log("data: (" + i + ", " + j + "): " + data[i][j]);
			}
		}*/
	},
	initList: function(currentMood) {
		/*TODO: 
		-> steek alle activity namen (label) in een array. CHECK
			-> maak een #arrays gelijk aan alle moods, 
				elk van deze arrays bevat #activities entries CHECK
		-> overloop alle MoodEntries in de database
			-> verhoog de score van de activiteit die bij die moodentry hoort
				gewoon de array van deze mood (of 2 moods) ophalen en daar de score van de juiste activiteit verhogen.
		-> rank de activiteiten volgens score per mood uiteraard
		*/
	
		var self = this;
		var list = $('#' + currentMood + 'list');
		
		
		
		
		
		
		//list.append('<li>' + 5 + '</li>').listview('refresh');
		this.app.database.iterateMoodActivities(
			//iter
			function(e){
				//self.list.trigger('create');
				//self.list.listview();
				//self.list.listview('refresh');
				self.appendToList(e, list);
				//self.list.listview('refresh');
			}, 
			//onSuccess
			function() {
			}
			, 
			//onError
			self.error
		);
	},
	appendToList: function(elem, list) {
		if(elem.active !== 'TRUE') {
			return;
		}
		var elemid = elem.id ? elem.id : this.getElemId(elem);
		var elemname = this.getElemName(elem);
		
		list.append('<li data-elem-id="' + elemid + '">'
			+ elemname + '</li>'
		).listview('refresh');
	},
	getElemId: function(elem) {
        return elem.id;
    },
    getElemName: function(elem) {
        return elem.name;
    }
});
