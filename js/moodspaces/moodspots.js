var MSMoodSpotsView = MSView.extend({
	init: function(app) {
        app.log("MSMoodSpotsView::init");
        this._super(app, 'moodspots');
        
        this.content = $("#moodspots > [data-role=content]");
    },
    load: function() {
        this.app.log("MSMoodSpotsView::load");
        this._super();
		var self = this;
		
		
		self.content.append('<div id="settingspopup" style="padding: 1.5em;">'
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
		
		self.content.append('<div id="map_canvas" style="width:100%;height:400px"></div>')
		// Also works with: var yourStartLatLng = '59.3426606750, 18.0736160278';
        var yourStartLatLng = new google.maps.LatLng(50.883, 4.7);
        $('#map_canvas').gmap({'center': yourStartLatLng, 'zoom':10});
		
		$('#map_canvas').gmap().bind('init', function(event, map) { 
			$(map).click( function(event) {
				$('#map_canvas').gmap('addMarker', {
					'position': event.latLng, 
					'draggable': true, 
					'bounds': false
				}, function(map, marker) {
					self.findLocation(marker.getPosition(), marker);
				}).dragend( function(event) {
					self.findLocation(event.latLng, this);
				}).click( function() {
					self.showPopup(this);
				})
			});
		});
    },
    unload: function() {
        this.app.log("MSMoodSpotsView::unload");
        this._super();
    },
	showPopup: function(marker) {
        var self = this;
        var buttons = $('#settingspopup > a[data-role=button]');
        var popup = $('#settingspopup');

        buttons.off('vclick');
        buttons.on('vclick', function() {
            var action = $(this).data('action');

            if (action === 'save') {
				var newName = $('#settingspopup > input').val();
                alert(action + ' is clicked with name ' + newName + 
					'\n' +
					marker.getPosition());
            } else if (action === 'remove') {
                alert(action + ' is clicked--');
            }
            
            $('#settingspopup > input').val('');
            popup.popup('close');
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
				self.showPopup(marker);
			}
		});
	}
	
	/*,
	openDialog: function(marker){
		//+marker.__gm_id
		$('#dialog').dialog(
			{
				modal:true, 
				title: 'Edit and save point',
				buttons: { 
					"Remove": function() {
						$(this).dialog( "close" );
						marker.setMap(null);
					},
					"Save": function() {
						$(this).dialog( "close" );
					}
				}
			}
		).dialog("open");
		
	}*/
});