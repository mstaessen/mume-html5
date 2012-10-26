var MoodSpaces = Class.extend({
	init: function() {
		this.log("MoodSpaces - Creating MoodSpaces instance");

		this.mainView = new MSMainView(this);
		this.newMoodView = new MSNewMoodView(this);
		this.moodPeepsView = new MSMoodPeepsView(this);
		this.moodSpotsView = new MSMoodSpotsView(this);
		this.moodTimesView = new MSMoodTimesView(this);
		this.moodTasksView = new MSMoodTasksView(this);
		
		this.currentView = this.mainView;
		
		var _this = this;
		
		$('#home').live('pageshow', function(event) {
			_this.mainView.load();
		});
		$('#new').live('pageshow', function(event) {
			_this.newMoodView.load();
		});
		$('#moodpeeps').live('pageshow', function(event) {
			_this.moodPeepsView.load();
		});
		$('#moodtimes').live('pageshow', function(event) {
			_this.moodTimesView.load();
		});
		$('#moodspots').live('pageshow', function(event) {
			_this.moodSpotsView.load();
		});
		$('#moodtasks').live('pageshow', function(event) {
			_this.moodTasksView.load();
		});
		
		var hash = document.location.hash;
		if (hash == '#new') {
			_this.newMoodView.load();
		} else if (hash == '#moodpeeps') {
			_this.moodPeepsView.load();
		} else if (hash == '#moodtimes') {
			_this.moodTimesView.load();
		} else if (hash == '#moodspots') {
			_this.moodSpotsView.load();
		} else if (hash == '#moodtasks') {
			_this.moodTasksView.load();
		}
	},
	log: function(txt) {
		// comment out to disable logging
		console.log(txt);
	}
});