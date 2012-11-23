var MSView = Class.extend({
    init: function(app, name) {
        this.app = app;
        this.viewname = name;
        
        this.error = function(error) {
            if (!error) return;
        
            var errorPopup = $('#' + name + '-error');
            var errorContent = $('#' + name + '-error > .errorcontent');
        
            errorContent.text((error.stack) ? error.stack.toString() : error.toString());
            errorPopup.popup('open');
        
            console.error(error.stack ? error.stack : error);
        }
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