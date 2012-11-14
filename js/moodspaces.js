var MoodSpaces = Class.extend({
    init: function() {
        this.log("MoodSpaces - Creating MoodSpaces instance");
        
        var self = this;
        
        this.database = new DataBase(this, 'MoodSpaces');
        // TODO this clears the old database, remove this when no longer needed
        this.database.delete(
            // onSuccess
            function() {
                self.log("Database MoodPlaces deleted");
            },
            // onError
            self.error,
            // name
            'MoodPlaces'
        );

        this.mainView = new MSMainView(this);
        this.newMoodView = new MSNewMoodView(this);
        this.moodPeepsView = new MSMoodPeepsView(this);
        this.moodSpotsView = new MSMoodSpotsView(this);
        this.moodTimesView = new MSMoodTimesView(this);
        this.moodTasksView = new MSMoodTasksView(this);
        this.settingsView = new MSSettingsView(this);
        
        this.currentView = this.mainView;
        
        $('#home').live('pageshow', function(event) {
            self.mainView.load();
        });
        $('#new').live('pageshow', function(event) {
            self.newMoodView.load();
        });
        $('#moodpeeps').live('pageshow', function(event) {
            self.moodPeepsView.load();
        });
        $('#moodtimes').live('pageshow', function(event) {
            self.moodTimesView.load();
        });
        $('#moodspots').live('pageshow', function(event) {
            self.moodSpotsView.load();
        });
        $('#moodtasks').live('pageshow', function(event) {
            self.moodTasksView.load();
        });
        $('#settings').live('pageshow', function(event) {
            self.settingsView.load();
        });
        
        var hash = this.__hash = document.location.hash;
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
    changePage: function(to, transition, reverse) {
        $.mobile.changePage(
            // to
            $('#' + to),
            // params
            {
                reverse: !!reverse,
                transition: (typeof transition == 'undefined') ? $.mobile.defaultPageTransition : transition
            }
        );
    },
    log: function(txt) {
        // comment out to disable logging
        console.log(txt);
    },
    error: function(error) {
        if (error instanceof Error) {
            console.error(error.stack);
        } else {
            console.error(error);
        }
    },
    
    shouldReload: function() {
        return !!this.__reload;
    },
    forceReload: function() {
        this.log("Forcing reload on next page load...");
        this.__reload = true;
    },
    
    getOpenedHash: function() {
        return this.__hash;
    }
});