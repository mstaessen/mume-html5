var MSSettingsView = MSView.extend({
    init: function(app) {
        app.log("MSSettingsView::init");
        this._super(app, 'settings');
        
        this.content = $("#settings > [data-role=content]");
        this.currentView = 'general';
        
        this.frames = {};
        
        this.frames.general = new MSSettingsView.GeneralSettingsFrame(this);
        this.frames.people = new MSSettingsView.PeopleSettingsFrame(this);
        this.frames.activities = new MSSettingsView.ActivitiesSettingsFrame(this);
        this.frames.places = new MSSettingsView.PlacesSettingsFrame(this);
    },
    load: function() {
        this.app.log("MSSettingsView::load");
        this._super();
        
        if (!this.currentFrame) {
            this.currentFrame = {
                unload: function() {}
            };
            this.frames.general.load();
        }
        
        var self = this;
        
        $('button[data-footer=settings]').on('click', function(event) {
            var newView = $(this).data('target');
            self.frames[newView].load();
        });
    },
    unload: function() {
        this.app.log("MSSettingsView::unload");
        this._super();
        
        // remove listeners to the buttons in the footer
        $('button[data-footer=settings]').off();
    }
});

MSSettingsView.SettingsFrame = Class.extend({
    init: function(view, name) {
        this.view = view;
        this.name = name;
    },
    load: function() {
        if (this.view.currentFrame === this) return false;
        
        this.view.currentFrame.unload();
        
        this.view.app.log("MSSettingsView::SettingsFrame::load() for frame " + this.name);
        this.view.currentFrame = this;
        $('button[data-footer=settings][data-target=' + this.name + ']').button('disable');
        
        return true;
    },
    unload: function() {
        this.view.app.log("MSSettingsView::SettingsFrame::unload() for frame " + this.name);
        $('button[data-footer=settings][data-target=' + this.name + ']').button('enable');
        this.view.content.html('');
    }
});

MSSettingsView.GeneralSettingsFrame = MSSettingsView.SettingsFrame.extend({
    init: function(view) {
        this._super(view, 'general');
    },
    load: function() {
        if (!this._super()) return;
    },
    unload: function() {
        this._super();
    }
});

MSSettingsView.PeopleSettingsFrame = MSSettingsView.SettingsFrame.extend({
    init: function(view) {
        this._super(view, 'people');
    },
    load: function() {
        if (!this._super()) return;
        
        var view = this.view;
        
        view.content.append('<table data-src="people"></table>');
        
        var table = $('table[data-src=people]');
        
//        view.app.db.
    },
    unload: function() {
        this._super();
    }
});

MSSettingsView.ActivitiesSettingsFrame = MSSettingsView.SettingsFrame.extend({
    init: function(view) {
        this._super(view, 'activities');
    },
    load: function() {
        if (!this._super()) return;
        
        var view = this.view;
        var self = this;
        
        view.content.append('<ul data-role="listview" data-filter-placeholder="true" data-table-role="activities"></ul>');
        var list = $('ul[data-table-role=activities]');
        
        view.app.database.iterateMoodActivities(
            //iter
            function (activity) {
                if (activity.active)
                    list.append('<li data-icon="delete"><a href="#settings" data-activity="' + activity.activityid + '"'
                        + '>' + activity.name + '</a></li>');
            },
            // onSuccess
            function() {
                view.content.trigger('create');
                list.listview('refresh');
                
                view.content.append('<br style="clear: both;" />');
                
                view.content.append('<div><input id="newactivityName" type="input" placeholder="New Activity" />'
                    + '<a id="newactivity" href="#settings" data-role="button" data-icon="plus">Add</a></div>');
                var newInput = $('#newactivityName');
                newInput.textinput();
        
                var addButton = $('#newactivity');
                addButton.button();
                addButton.on('vclick', function(event) {
                    var activity = newInput.val();
                    
                    if (!activity || activity === '') {
                        view.error("Please enter an activity...");
                    }
                    
                    view.app.database.addMoodActivity(
                        // name
                        activity,
                        // onSuccess
                        function() {
                            list.append('<li data-icon="delete"><a href="#settings" data-activity="' + activity + '"'
                                + '>' + activity + '</a></li>');
                            list.listview('refresh');
                            newInput.val('');
                        },
                        // onError
                        function(e) { 
                            view.error(e);
                        }
                    );
                });
            },
            // onError
            view.error
        )
    },
    unload: function() {
        this._super();
    }
});

MSSettingsView.PlacesSettingsFrame = MSSettingsView.SettingsFrame.extend({
    init: function(view) {
        this._super(view, 'places');
    },
    load: function() {
        if (!this._super()) return;
        
        var view = this.view;
        var self = this;
        
        view.content.append('<ul data-role="listview" data-filter-placeholder="true" data-table-role="places"></ul>');
        var list = $('ul[data-table-role=places]');
        
        view.app.database.iterateMoodSpotsNames(
            //iter
            function (spot) {
                list.append('<li data-icon="delete"><a href="#settings" data-place="' + spot + '"'
                    + '>' + spot + '</a></li>');
            },
            // onSuccess
            function() {
                view.content.trigger('create');
                list.listview('refresh');
                
                view.content.append('<br style="clear: both;" />');
                
                view.content.append('<div><input id="newspotName" type="input" placeholder="New MoodSpot" />'
                    + '<a id="newspot" href="#settings" data-role="button" data-icon="plus">Add</a></div>');
                var newInput = $('#newspotName');
                newInput.textinput();
        
                var addButton = $('#newspot');
                addButton.button();
                addButton.on('vclick', function(event) {
                    var spot = newInput.val();
                    
                    if (!spot || spot === '') {
                        view.error("Please enter a spot...");
                    }
                    
                    view.app.database.addMoodSpot(
                        // name
                        spot,
                        // onSuccess
                        function() {
                            list.append('<li data-spot="' + spot + '">' + spot + '</li>');
                            list.listview('refresh');
                            newInput.val('');
                        },
                        // onError
                        view.error
                    );
                });
            },
            // onError
            view.error
        )
    },
    unload: function() {
        this._super();
    }
});