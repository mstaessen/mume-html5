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
    },
    error: function(error) {
        var errorPopup = $('#error > .errorpopup');
        var errorContent = $('#error > .errorpopup > .errorcontent');
        
        errorContent.html((error instanceof Error) ? error.stack : error);
        errorPopup.popup('open');
        
        // TODO general error function
        if (error instanceof Error) {
            console.error(error.stack);
        } else {
            console.error(error);
        }
    }
});