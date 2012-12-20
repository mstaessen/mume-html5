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
        this.frames.spots = new MSSettingsView.SpotsSettingsFrame(this);
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

MSSettingsView.ListSettingsFrame = MSSettingsView.SettingsFrame.extend({
    init: function(view, name) {
        this._super(view, name);
    },
    load: function() {
        if(!this._super())
            return;
        
        var contentpane = this.view.content;
        var self = this;
        
        // Create the popup
        
        contentpane.append('<div id="settingspopup" style="padding: 1.5em;">'
                +'<h3>Edit post</h3>'
                +'<input type="text" id="rename"></input>'
                +'<a data-action="rename" data-role="button" data-inline="true" data-icon="check">Rename</a>'
			    +'<a data-action="cancel" data-role="button" data-inline="true">Cancel</a>'
		        +'<a data-action="remove" data-role="button" data-icon="delete" data-theme="r">Remove</a>'
		    +'</div>');
        
        this.popup = $('#settingspopup');
        var popup = this.popup;
        
        popup.trigger('create');
        popup.popup();
		popup.popup('close');
        
        // Create the list
        contentpane.append('<ul data=role="listview" data-filter-placeholder="true" data-table-role="settingslist"></ul>');
        this.list = $('ul[data-table-role=settingslist]');
        var list = this.list;
        
        this.iterateElements(
            // iter
            function(e) {
                self.appendToList(e, true);
            },
            // onSuccess
            function() {
                list.trigger('create');
                list.listview();
                list.listview('refresh');
                
                contentpane.append('<br style="clear: both;" />');
                contentpane.append('<div><input id="newname" type="text" placeholder="New" />'
                        + '<a id="addelem" data-role="button" data-icon="plus">Add</a></div>');
                $('#newname').parent().trigger('create');
                
                $('#addelem').on('vclick', function() {
                    var name = $('#newname').val();
                    self.storeNewElement(
                        // new name
                        name,
                        // onSuccess
                        function(id) {
                            self.appendToList({ id: id, name: name, active: 'TRUE' });
                            $('#newname').val('');
                        },
                        // onError
                        self.view.error
                    )
                });
                
                self.resetListElemListeners();
            },
            // onError
            self.view.error
        );
    },
    unload: function() {
		$('#settingspopup').remove();
        this._super();
    },
    appendToList: function(elem, batchMode) {
        if (elem.active !== 'TRUE') {
            return;
        }
        
        var elemid = elem.id ? elem.id : this.getId(elem);
        var elemname = this.getName(elem);
        
        this.list.append('<li data-split-icon="gear" data-elem-id="' + elemid + '">'
                +'<a class="elem" data-elem-id="' + elemid + '">' + elemname + '</a>'
                +'<a class="editelem" data-elem-id="' + elemid + '" data-elem-name="' + elemname + '">Edit</a>'
            +'</li>'
        );
        
        if (!batchMode) {
            this.list.listview('refresh');
            this.resetListElemListeners();
        }
    },
    resetListElemListeners: function() {
        var self = this;
        var editbuttons = $('a.editelem');
        
        editbuttons.off('vclick');
        editbuttons.on('vclick', function() {
            self.editingElement = $(this).data('elem-id');
            $('#rename').val($(this).data('elem-name'));
            
            self.showPopup();
        });
    },
    getId: function(elem) {
        return elem.id;
    },
    getName: function(elem) {
        return elem.name;
    },
    storeNewElement: function(name, onSuccess, onError) {
        onError(new Error("Stub ListSettingsFrame::storeNewElement"));
    },
    iterateElements: function(iter, onSuccess, onError) {
        onError(new Error("Stub ListSettingsFrame::iterateElements"));
    },
    renameElement: function(id, newName, onSuccess, onError) {
        onError(new Error("Stub ListSettingsFrame::renameElement"));
    },
    removeElement: function(id, onSuccess, onError) {
        onError(new Error("Stub ListSettingsFrame::removeElement"));
    },
    showPopup: function() {
        var self = this;
        var buttons = $('#settingspopup > a[data-role=button]');
        var popup = $('#settingspopup');

        buttons.off('vclick');
        buttons.on('vclick', function() {
            var action = $(this).data('action');

            if (action === 'rename') {
                var newName = $('#settingspopup > input').val();
                self.renameElement(
                    // id
                    self.editingElement,
                    // new name
                    newName,
                    // onSuccess
                    function() {
                        $('a.elem[data-elem-id=' + self.editingElement + ']').text(newName);
                        self.list.listview('refresh');
                    },
                    // onError
                    self.view.error
                );
            } else if (action === 'remove') {
                self.removeElement(
                    // id
                    self.editingElement,
                    // onSuccess
                    function() {
                        $('li[data-elem-id=' + self.editingElement + ']').remove();
                        self.list.listview('refresh');
                    },
                    // onError
                    self.view.error
                );
            }
            
            $('#settingspopup > input').val('');
            popup.popup('close');
        });
        
        popup.popup('open');
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

MSSettingsView.ActivitiesSettingsFrame = MSSettingsView.ListSettingsFrame.extend({
    init: function(view) {
        this._super(view, 'activities');
    },
    getId: function(elem) {
        return elem.id ? elem.id : elem.activityid;
    },
    storeNewElement: function(name, onSuccess, onError) {
        this.view.app.database.addMoodActivity(name, onSuccess, onError);
    },
    iterateElements: function(iter, onSuccess, onError) {
        this.view.app.database.iterateMoodActivities(iter, onSuccess, onError);
    },
    renameElement: function(id, newName, onSuccess, onError) {
        this.view.app.database.renameMoodActivity(id, newName, onSuccess, onError);
    },
    removeElement: function(id, onSuccess, onError) {
        this.view.app.database.deactivateMoodActivity(id, onSuccess, onError);
    }
});

/*MSSettingsView.SpotsSettingsFrame = MSSettingsView.ListSettingsFrame.extend({
    init: function(view) {
        this._super(view, 'spots');
    },
    getId: function(elem) {
        return elem.id ? elem.id : elem.spotid;
    },
    storeNewElement: function(name, onSuccess, onError) {
        this.view.app.database.addMoodSpot(name, onSuccess, onError);
    },
    iterateElements: function(iter, onSuccess, onError) {
        this.view.app.database.iterateMoodSpots(iter, onSuccess, onError);
    },
    renameElement: function(id, newName, onSuccess, onError) {
        this.view.app.database.renameMoodSpot(id, newName, onSuccess, onError);
    },
    removeElement: function(id, onSuccess, onError) {
        this.view.app.database.deactivateMoodSpot(id, onSuccess, onError);
    }
});*/

MSSettingsView.SpotsSettingsFrame = MSSettingsView.SettingsFrame.extend({
    init: function(view) {
        this._super(view, 'spots');
    },
    load: function() {
        if (!this._super()) return;
        var self = this;
        var contentpane = this.view.content;
		
		contentpane.append('<div id="settingspopup" style="padding: 1.5em;">'
                +'<h3>Edit post</h3>'
                +'<input type="text" id="nameField"></input>'
                +'<a data-action="save" data-role="button" data-inline="true" data-icon="check">Save</a>'
			    +'<a data-action="cancel" data-role="button" data-inline="true">Cancel</a>'
		        +'<a data-action="remove" data-role="button" data-icon="delete" data-theme="r">Remove</a>'
		    +'</div>');
		this.popup = $('#settingspopup');
		var popup = this.popup;
        popup.trigger('create');
        popup.popup();
		
		contentpane.append('<div id="map_canvas" style="width:100%;height:50%"></div>');
		var yourStartLatLng = new google.maps.LatLng(50.883, 4.7);
        $('#map_canvas').gmap({'center': yourStartLatLng, 'zoom':10});
		
		this.view.app.database.iterateMoodSpots(
			//iter
			function(spot){
				var spotPosition = new google.maps.LatLng(spot.latitude, spot.longitude);
				$('#map_canvas').gmap('addMarker', 
					{
					'position': spotPosition, 
					'draggable': true, 
					'bounds': false
					}, function(map, marker) {
						self.findLocation(marker.getPosition(), marker);
				}).dragend(function(event){
					self.findLocation(event.latLng, this);
					self.showPopup(this, 'edit');
				}).click( function() {
					self.showPopup(this, 'edit');
				});
			},
			//onSuccess
			function(){
			}, 
			//onError
			self.error
		);
		
		$('#map_canvas').gmap().bind('init', function(event, map) { 
			$(map).click( function(event) {
				$('#map_canvas').gmap('addMarker', {
					'position': event.latLng, 
					'draggable': true, 
					'bounds': false
				}, function(map, marker) {
					self.findLocation(marker.getPosition(), marker);
					self.showPopup(marker, 'new');
				}).dragend(function(event){
					self.findLocation(event.latLng, this);
					self.showPopup(this, 'edit');
				}).click( function() {
					if(self.popped === 'off'){
						self.showPopup(this, 'edit');
					}
				})
			});
		});
    },
    unload: function() {
		$('#settingspopup').remove();
        this._super();
    },
	showPopup: function(marker, mode) {
        var self = this;
        var buttons = $('#settingspopup > a[data-role=button]');
        var popup = $('#settingspopup');

        buttons.off('vclick');
        buttons.on('vclick', function() {
			self.popped = 'on';
            var action = $(this).data('action');

            if (action === 'save') {
				var newName = $('#settingspopup > input').val();
				var latitude = marker.getPosition().lat();
				var longitude = marker.getPosition().lng();
				self.storeNewElement(
					// new name
					newName,
					latitude,
					longitude,
					// onSuccess
					function(id) {
						$('#settingspopup > input').val('');
					},
					// onError
					self.error
				);
				
            } else if (action === 'remove') {
                //alert(action + ' is clicked--');
				var latitude = marker.getPosition().lat();
				var longitude = marker.getPosition().lng();
				self.getIdForLatLng(
					latitude,
					longitude,
					//onSuccess
					function(id){
						//Remove moodspot
						self.view.app.database.deactivateMoodSpot(
							id, 
							function(){
								marker.setMap(null);
							}, 
							self.error
						);
					},
					//onError
					self.error
				);
            } else{
				if(mode === 'new'){
					marker.setMap(null);
				}
			}
            
            $('#settingspopup > input').val('');
            popup.popup('close');
			self.popped = 'off';
        });
        
        popup.popup('open');
    },
	findLocation: function(location, marker) {
		var self = this;
		$('#map_canvas').gmap('search', {'location': location}, function(results, status) {
			if ( status === 'OK' ) {
				$.each(results[0].address_components, function(i,v) {
					if ( v.types[0] == "administrative_area_level_1" || 
						 v.types[0] == "administrative_area_level_2" ) {
						//$('#state'+marker.__gm_id).val(v.long_name);
					} else if ( v.types[0] == "country") {
						//$('#country'+marker.__gm_id).val(v.long_name);
					}
				});
				marker.setTitle(results[0].formatted_address);
				//$('#address'+marker.__gm_id).val(results[0].formatted_address);
				//self.showPopup(marker);
			}
		});
	},
	storeNewElement: function(name, latitude, longitude, onSuccess, onError){
		this.view.app.database.addMoodSpot(name, latitude, longitude, onSuccess, onError);
	},
	getIdForLatLng: function(latitude, longitude, onSuccess, onError) {
        this.view.app.database.getMoodSpotIdForLatLng(latitude, longitude, onSuccess, onError);
    },
	error: function(error){
		if (error instanceof Error) {
			console.error(error.stack);
		} else {
			console.error(error);
		}
	}
});