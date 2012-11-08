var MSMainView = MSView.extend({
    init: function(app) {
        app.log('MSMainView::init');
        this._super(app);
    },
    load: function() {
        this.app.log('MSMainWindow::load');
        this._super();
    },
    unload: function() {
        this.app.log('MSMainWindow::unload');
        this._super();
    }
});