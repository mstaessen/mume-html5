var MSSettingsView = MSView.extend({
    init: function(app) {
        app.log("MSSettingsView::init");
        this._super(app);
        
        this.content = $("#settings > [data-role=content]");
        this.currentView = 'general';
        
        this.frames = {};
        
        this.frames.general = new MSSettingsView.GeneralSettingsFrame(this);
        this.frames.people = new MSSettingsView.PeopleSettingsFrame(this);
        this.frames.activities = new MSSettingsView.ActivitiesSettingsFrame(this);
        this.frames.places = new MSSettingsView.PlacesSettingsFrame(this);
        
        this.currentFrame = {
            unload: function() {}
        };
        this.frames.general.load();
    },
    load: function() {
        this.app.log("MSSettingsView::load");
        this._super();
        
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
        if (this.view.currentFrame === this) return;
        
        this.view.currentFrame.unload();
        
        this.view.app.log("MSSettingsView::SettingsFrame::load() for frame " + this.name);
        this.view.currentFrame = this;
    },
    unload: function() {
        this.view.app.log("MSSettingsView::SettingsFrame::unload() for frame " + this.name);
    }
});

MSSettingsView.GeneralSettingsFrame = MSSettingsView.SettingsFrame.extend({
    init: function(view) {
        this._super(view, 'general');
    },
    load: function() {
        this._super();
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
        this._super();
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
        this._super();
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
        this._super();
    },
    unload: function() {
        this._super();
    }
});