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
        
        // check if we need to refresh
        if (this.app.shouldReload()) {
            this.app.log("Reload forced, reloading...");
            document.location.reload();
        }
    },
    unload: function() {
        this.app.log('MSView::unload');
        // NOP
    }
});