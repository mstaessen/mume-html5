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
		keys['moodSpots'] = 'moodSpots';
		keys['moodEntries_spotIdx'] = 'entrySpotIdx';
		keys['moodEntries_activityIdx'] = 'entryActivityIdx';
		keys['moodEntries_timestampIdx'] = 'entryTimeStampIdx';
		keys['moodSpots_nameIdx'] = 'moodSpotsNameIdx';
		
		$.indexedDB(name, {
			"version": 2,
			"upgrade": function(tx) {
				app.log('upgrading database');
			},
			"schema": {
				"1": function(tx) {
					var moodEntries = tx.createObjectStore(keys['moodEntries'], {
						"autoIncrement": true,
						"keyPath": "entryId"
					});
					moodEntries.createIndex("spot", {
						"unique": false,
						"multiEntry": false
					}, keys['moodEntries_spotIdx']);
					moodEntries.createIndex("activity", {
						"unique": false,
						"multiEntry": false
					}, keys['moodEntries_activityIdx']);
					
					var moodSpots = tx.createObjectStore(keys['moodSpots'], {
						"autoIncrement": true,
						"keyPath": "spotId"
					});
					moodSpots.createIndex("name", {
						"unique": true
					}, keys['moodSpots_nameIdx']);
				},
				"2": function(tx) {
					var moodEntries = tx.objectStore(keys['moodEntries']);
					moodEntries.createIndex("timestamp", {
						"unique": true
					}, keys['moodEntries_timestampIdx']);
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
	
	/* DataBase::hasMoodSpot(String name, Function onSuccess, Function onError)
	 *
	 *	On success: onSuccess(result) is called, with result true if the moodspot with the given name exists.
	 *  On failure: onError(error) is called
	 */
	hasMoodSpot: function(name, onSuccess, onError) {
		try{
			this.open('moodSpots').index(this.keys['moodSpots_nameIdx']).get(name).then(function(item) {
				onSuccess(typeof item != "undefined");
			}, function(error, event) {
				onError(error, event);
			});
		} catch (error) {
			onError(error);
		}
	},
	/* DataBase::addMoodSpot(String name, Function onSuccess, Function onError)
	 *
	 *  On success: onSuccess(id) is called with the id of the new MoodSpot
	 *  On error: onError(error) is called
	 *  If the MoodSpot already exists, onErorr(AlreadyExistsException) is called
	 */
	addMoodSpot: function(name, onSuccess, onError) {
		var self = this;
		self.hasMoodSpot(name, function(found) {
			if (found) {
				onError(new AlreadyExistsException("MoodSpot " + name + " already exists"));
				return;
			}
			
			try {
				self.open('moodSpots').add({name: name});
			} catch (error) {
				onError(error);
			}
			self.getMoodSpotId(name, onSuccess, onError);
		}, onError);
	},
	/* DataBase::getMoodSpotId(String name, Function onSuccess, Function onError)
	 *
	 *  On success: onSuccess(id) is called with the Id of the moodspot
	 *  If not found: onError(NotFoundException)
	 *  On error: onError(Error)
	 */
	getMoodSpotId: function(name, onSuccess, onError) {
		try {
			this.open('moodSpots').index(this.keys['moodSpots_nameIdx']).getKey(name).then(function(key) {
				if (typeof key == "undefined") {
					onError(new NotFoundException("MoodSpot with name " + name + " doesn't exist"));
				} else {
					onSuccess(key);
				}
			}, onError);
		} catch (error) {
			onError(error);
		}
	},
	/* DataBase::getMoodSpot(Integer id, Function onSuccess, Function onError)
	 *
	 *  On success: onSuccess(name) is called with the name of the moodspot
	 *  If not found: onError(NotFoundException)
	 *  On error: onError(Error)
	 */
	getMoodSpot: function(id, onSuccess, onError) {
		try {
			this.open('moodSpots').get(id).then(function(item) {
				if (typeof item != 'undefined') {
					onSuccess(item.name);
				} else {
					onError(new NotFoundException("MoodSpot with id " + id + " doesn't exist"));
				}
			}, onError);
		} catch (error) {
			onError(error);
		}
	},

	/* The MoodEntry object:
	 *	(var)		timestamp:	a timestamp
	 *	(String)	spot:		the name of location (or the id?)
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
	// which getters? (allow to iterate, allow to get all entries of a day ...
});
