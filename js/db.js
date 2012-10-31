/*
 * This file contains the DataBase class.
 */
 
Error.subClass("DataBaseException");

DataBaseException.subClass("NotFoundException");
DataBaseException.subClass("AlreadyExistsException");
 
var DataBase = Class.extend({
	init: function(app, name) {
		this.app = app;
		this.dbname = name;
		
		var keys = this.keys = [];
		keys['moodEntries'] = 'moodEntries';
		keys['moodPlaces'] = 'moodPlaces';
		keys['moodEntries_placeIdx'] = 'entryPlaceIdx';
		keys['moodEntries_activityIdx'] = 'entryActivityIdx';
		keys['moodPlaces_nameIdx'] = 'moodPlacesNameIdx';
		
		$.indexedDB(name, {
			"version": 1,
			"upgrade": function(tx) {
				app.log('upgrading database');
			},
			"schema": {
				"1": function(tx) {
					var moodEntries = tx.createObjectStore(keys['moodEntries'], {
						"autoIncrement": true,
						"keyPath": "entryId"
					});
					moodEntries.createIndex("place", {
						"unique": false,
						"multiEntry": false
					}, keys['moodEntries_placeIdx']);
					moodEntries.createIndex("activity", {
						"unique": false,
						"multiEntry": false
					}, keys['moodEntries_activityIdx']);
					
					var moodPlaces = tx.createObjectStore(keys['moodPlaces'], {
						"autoIncrement": true,
						"keyPath": "placeId"
					});
					moodPlaces.createIndex("name", {
						"unique": true
					}, keys['moodPlaces_nameIdx']);
				}
			}
		}).done(function(db, event) {
			app.log('database ' + name + ' opened');
		}).fail(function(error, event) {
			app.log('erorr when opening database ' + name, error, event);
		}).progress(function(error, event) {
			app.log('error when opening database ' + name, error, event);
		});
	},
	
	/* DataBase::open(String key)
	 *
	 *	Internal use only! Returns the objectStore for the given key.
	 */
	open: function(key) {
		return $.indexedDB(this.dbname).objectStore(this.keys[key]);
	},
	
	/* DataBase::hasMoodPlace(String name, Function onSuccess, Function onError)
	 *
	 *	On success: onSuccess(result) is called, with result true if the moodplace with the given name exists.
	 *  On failure: onError(error) is called
	 */
	hasMoodPlace: function(name, onSuccess, onError) {
		try{
			this.open('moodPlaces').index(this.keys['moodPlaces_nameIdx']).get(name).then(function(item) {
				onSuccess(typeof item != "undefined");
			}, function(error, event) {
				onError(error, event);
			});
		} catch (error) {
			onError(error);
		}
	},
	/* DataBase::addMoodPlace(String name, Function onSuccess, Function onError)
	 *
	 *  On success: onSuccess(id) is called with the id of the new MoodPlace
	 *  On error: onError(error) is called
	 *  If the MoodPlace already exists, onErorr(AlreadyExistsException) is called
	 */
	addMoodPlace: function(name, onSuccess, onError) {
		var self = this;
		self.hasMoodPlace(name, function(found) {
			if (found) {
				onError(new AlreadyExistsException("MoodPlace " + name + " already exists"));
				return;
			}
			
			try {
				self.open('moodPlaces').add({name: name});
			} catch (error) {
				onError(error);
			}
			self.getMoodPlaceId(name, onSuccess, onError);
		}, onError);
	},
	/* DataBase::getMoodPlaceId(String name, Function onSuccess, Function onError)
	 *
	 *  On success: onSuccess(id) is called with the Id of the moodplace
	 *  If not found: onError(NotFoundException)
	 *  On error: onError(Error)
	 */
	getMoodPlaceId: function(name, onSuccess, onError) {
		try {
			this.open('moodPlaces').index(this.keys['moodPlaces_nameIdx']).getKey(name).then(function(key) {
				if (typeof key == "undefined") {
					onError(new NotFoundException("MoodPlace with name " + name + " doesn't exist"));
				} else {
					onSuccess(key);
				}
			}, onError);
		} catch (error) {
			onError(error);
		}
	},
	/* DataBase::getMoodPlace(Integer id, Function onSuccess, Function onError)
	 *
	 *  On success: onSuccess(name) is called with the name of the moodplace
	 *  If not found: onError(NotFoundException)
	 *  On error: onError(Error)
	 */
	getMoodPlace: function(id, onSuccess, onError) {
		try {
			this.open('moodPlaces').get(id).then(function(item) {
				if (typeof item != 'undefined') {
					onSuccess(item.name);
				} else {
					onError(new NotFoundException("MoodPlace with id " + id + " doesn't exist"));
				}
			}, onError);
		} catch (error) {
			onError(error);
		}
	},

	/* The MoodEntry object:
	 *	(var)		timestamp:	a timestamp
	 *	(String)	place:		the name of location (or the id?)
	 *	(Array<String>)	people: 	the people (their names)
	 *	(MoodSelection) selection:	the selection on the wheel
	 */

	/* The MoodSelection object:
	 * 	(float)		r:		the radius (normalized!)
	 *	(float)		phi:		the angle, in radians
	 */

	/* DataBase::addMoodEntry(MoodEntry entry, Function onSuccessm, Function onError)
	 *
	 * On success: onSuccess() is called
	 * On error: onError(error) is called
	 */
	addMoodEntry: function(entry, onSuccess, onError) {
		try {
			this.open('moodEntries').add(entry).then(onSuccess, onError);
		} catch (error) {
			onError(error);
		}
	}
});
