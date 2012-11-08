var MSView = Class.extend({
    init: function(app) {
        this.app = app;
    },
    load: function() {
        this.app.log('MSView::load');
        
        // unload the current view
        this.app.currentView.unload();
        
        // set this as the current view
        this.app.currentView = this;
    },
    unload: function() {
        this.app.log('MSView::unload');
        // NOP
    }
});