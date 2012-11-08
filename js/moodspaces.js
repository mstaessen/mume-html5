var MoodSpaces = Class.extend({
    init: function() {
        this.log("MoodSpaces - Creating MoodSpaces instance");
        
        this.database = new DataBase(this, 'MoodPlaces');

        this.mainView = new MSMainView(this);
        this.newMoodView = new MSNewMoodView(this);
        this.moodPeepsView = new MSMoodPeepsView(this);
        this.moodSpotsView = new MSMoodSpotsView(this);
        this.moodTimesView = new MSMoodTimesView(this);
        this.moodTasksView = new MSMoodTasksView(this);
        this.settingsView = new MSSettingsView(this);
        
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
        $('#settings').live('pageshow', function(event) {
            _this.settingsView.load();
        });
        
        var hash = document.location.hash;
        if (hash == '#new') {
            this.newMoodView.load();
        } else if (hash == '#moodpeeps') {
            this.moodPeepsView.load();
        } else if (hash == '#moodtimes') {
            this.moodTimesView.load();
        } else if (hash == '#moodspots') {
            this.moodSpotsView.load();
        } else if (hash == '#moodtasks') {
            this.moodTasksView.load();
        } else if (hash == '#settings') {
            this.settingsView.load();
        }
    },
    log: function(txt) {
        // comment out to disable logging
        console.log(txt);
    }
});