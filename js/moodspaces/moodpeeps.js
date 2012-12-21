var MSMoodPeepsView = MSView.extend({
	init: function(app) {
        app.log("MSMoodPeepsView::init");
        this._super(app, 'moodpeeps');
        
        this.content = $("#moodpeeps > [data-role=content]");
		this.moods = [];
		var bigMoods = app.newMoodView.getMoods();
		for(var i=0; i< bigMoods.length; i++ ){
			this.moods[i] = bigMoods[i].label;
		}
		this.scoreMultiplier = 100;
    },
	load: function() {
        this.app.log("MSMoodPeepsView::load");
        this._super();
		var self = this;
		
		
		this.app.database.getAllMoodPersons(
			function(persons) {
				//self.calcPersonMoods(persons);
				for(var i=0; i< persons.length; i++ ){
					var person = persons[i];
					self.app.log('person: ' + person.name + ' (' + person.peepid + ')');
				}
			},
			self.error,
			function(person){
				return person;
			}
		);
    },
    unload: function() {
        this.app.log("MSMoodPeepsView::unload");
        this._super();
		/*for(var i=0; i<this.moods.length; i++){
			$('#' + this.moods[i] + 'list').empty().listview('refresh');
		}*/
    },
});