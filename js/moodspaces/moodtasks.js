var MSMoodTasksView = MSView.extend({
	init: function(app) {
        app.log("MSMoodTasksView::init");
        this._super(app, 'moodtasks');
        
        this.content = $("#moodtasks > [data-role=content]");
    },
    load: function() {
        this.app.log("MSMoodTasksView::load");
        this._super();
		
		var self = this;
		var moods = ['fear', 'surprise', 'sadness', 'disgust', 'anger', 'anticipation', 'joy', 'trust'];
		
		for(var j = 0; j < moods.length; j++) {
			self.initList(moods[j]);
		}
    },
    unload: function() {
        this.app.log("MSMoodTasksView::unload");
        this._super();
    },
	initList: function(currentMood) {
		/*TODO: 
		-> steek alle activity namen (label) in een array.
			-> maak een #arrays gelijk aan alle moods, 
				elk van deze arrays bevat #activities entries
		-> overloop alle MoodEntries in de database
			-> verhoog de score van de activiteit die bij die moodentry hoort
				gewoon de array van deze mood (of 2 moods) ophalen en daar de score van de juiste activiteit verhogen.
		-> rank de activiteiten volgens score per mood uiteraard
		*/
	
	
	
		//var currentMood = moods[j];
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
