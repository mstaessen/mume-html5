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
        keys['moodSpots'] = 'moodSpots';
        keys['moodSpots_nameIdx'] = 'moodSpotsNameIdx';
        keys['moodEntries'] = 'moodEntries';
        keys['moodEntries_spotIdx'] = 'entrySpotIdx';
        keys['moodEntries_activityIdx'] = 'entryActivityIdx';
        keys['moodEntries_timestampIdx'] = 'entryTimeStampIdx';
        keys['moodActivities'] = 'moodActivities';
        keys['moodActivities_nameIdx'] = 'activitiesNameIdx';
        
        $.indexedDB(name, {
            "version": 3,
            "upgrade": function(tx) {
                app.log('upgrading database');
            },
            "schema": {
                "1": function(tx) {
                    app.log("Installing v1 of the database schema");
                    
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
                    app.log("Installing v2 of the database schema");
                    
                    var moodEntries = tx.objectStore(keys['moodEntries']);
                    moodEntries.createIndex("timestamp", {
                        "unique": true
                    }, keys['moodEntries_timestampIdx']);
                },
                "3": function(tx) {
                    app.log("Installing v3 of the database schema");
                    
                    var moodActivities = tx.createObjectStore(keys['moodActivities'], {
                        "autoIncrement": true,
                        "keyPath": "activityId"
                    });
                    moodActivities.createIndex("name", {
                        "unique": true
                    }, keys['moodActivities_nameIdx']);
                }
            }
        }).done(function(db, event) {
            app.log('database ' + name + ' opened');
        }).fail(function(error, event) {
            app.log('erorr when opening database ' + name, error, event);
        }).progress(function(error, event) {
            app.log('still opening database ' + name, error, event);
        });
    },
    
    /* DataBase::identity(var e)
     *
     *  Returns e
     */
    identity: function(e) {
        return e;
    },
    
    /* DataBase::_open(String key)
     *
     *  Internal use only!
     *  Returns the objectStore for the given key.
     */
    _open: function(key) {
        return $.indexedDB(this.dbname).objectStore(this.keys[key]);
    },
    /* DataBase::_index(String store, String idx)
     *
     *  Internal use only!
     *  Returns index (store + '_' + idx) of objectStore store
     */
    _index: function(store, idx) {
         return this._open(store).index(this.keys[store + '_' + idx]);
    },
    
    /* DataBase::_iterate(String store, Function iter, Function onSuccess, Function onError[, Function map])
     *
     *  Internal use only!
     *  On success: onSuccess() is called
     *  On error: onError(error) is called
     *  Each iteration: iter(map(value)) is called with value from the ObjectStore store
     *  Function map: if not set, this function is set to DataBase::identity
     */
    _iterate: function(store, iter, onSuccess, onError, map) {
        if (typeof map == 'undefined') {
            map = this.identity;
        }
        
        try {
            this._open(store).each(
                function(element) {
                    iter(map(element.value));
                }
            ).then(onSuccess, onError);
        } catch (error) {
            onError(error);
        }
    },
    /* DataBase::_getAll(String store, Function onSuccess, Function onError[, Function map])
     *
     *  Internal use only!
     *  On success: onSuccess(res) is called, with res the array of all elements in the store
     *  On error: onError(error) is called
     *  Function map: if not set, this function is set to DataBase::identity
     */
    _getAll: function(store, onSuccess, onError, map) {
        try {
            var retVal = [];
            
            this._iterate(
                // store
                store,
                // iter
                function(element) {
                    retVal.push(element);
                },
                // onSuccess
                function() {
                    onSuccess(retVal);
                },
                onError,
                map
            );
        } catch (error) {
            onError(error);
        }
    },
    
    /* DataBase::hasMoodSpot(String name, Function onSuccess, Function onError)
     *
     *  On success: onSuccess(result) is called, with result true if the moodspot with the given name exists.
     *  On failure: onError(error) is called
     */
    hasMoodSpot: function(name, onSuccess, onError) {
        try{
            this.getMoodSpotId(name,
                // onSuccess
                function() {
                    onSuccess(true);
                },
                // onError
                function(e) {
                    if (e instanceof NotFoundException) {
                        onSuccess(false);
                    } else {
                        onError(e);
                    }
                }
            );
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
                self._open('moodSpots').add({name: name});
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
            this._index('moodSpots', 'nameIdx').getKey(name).then(function(key) {
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
            this._open('moodSpots').get(id).then(function(item) {
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
    /* DataBase::getAllMoodSpots(Function onSuccess, Function onError[, Function map])
     *
     *  On success: onSuccess(spots) is called, with spots an array of the the spot objects,
     *              unless map is set, then spots is an array of the result of map.
     *  On error: onError(error) is called
     *  The map function: function(spot) { return spot.name; } results in an array of names.
     */
    getAllMoodSpots: function(onSuccess, onError, map) {
        this._getAll('moodSpots', onSuccess, onError, map);
    },
    /* DataBase::getAllMoodSpotsNames(Function onSuccess, Function onErorr)
     *
     *  On success: onSuccess(names) is called, with names an array of all names
     *  On error: onErorr(error) is called
     */
    getAllMoodSpotsNames: function(onSuccess, onError) {
        this.getAllMoodSpots(onSuccess, onError,
            function(spot) {
                return spot.name;
            }
        );
    },
    /* DataBase::iterateMoodSpots(Function iter, Function onSuccess, Function onErorr[, Function map])
     *
     *  On success: onSuccess() is called
     *  On error: onError(error) is called
     *  Each moodspot: iter(map(spot)) is called, with spot a MoodSpot
     *  If map is not given, map is the identity function
     */
    iterateMoodSpots: function(iter, onSuccess, onError, map) {
        this._iterate('moodSpots', iter, onSuccess, onError, map);
    },
    /* DataBase::iterateMoodSpotsNames(Function iter, Function onSuccess, Function onErorr)
     *
     *  On success: onSuccess() is called
     *  On error: onError(error) is called
     *  Each moodspot: iter(spot.name) is called, with spot a MoodSpot
     */
    iterateMoodSpotsNames: function(iter, onSuccess, onError) {
        this.iterateMoodSpots(iter, onSuccess, onError,
            function(spot) {
                return spot.name;
            }
        );
    },
    
    /* DataBase::hasMoodActivity(String name, Function onSuccess, Function onError)
     *
     *  On success: onSuccess(result) is called, with result true if the moodactivity with the given name exists.
     *  On failure: onError(error) is called
     */
    hasMoodActivity: function(name, onSuccess, onError) {
        try{
            this.getMoodActivityId(name,
                // onSuccess
                function() {
                    onSuccess(true);
                },
                // onError
                function(e) {
                    if (e instanceof NotFoundException) {
                        onSuccess(false);
                    } else {
                        onError(e);
                    }
                }
            );
        } catch (error) {
            onError(error);
        }
    },
    /* DataBase::addMoodActivity(String name, Function onSuccess, Function onError)
     *
     *  On success: onSuccess(id) is called with the id of the new MoodActivity
     *  On error: onError(error) is called
     *  If the MoodActivity already exists, onErorr(AlreadyExistsException) is called
     */
    addMoodActivity: function(name, onSuccess, onError) {
        var self = this;
        self.hasMoodActivity(name, function(found) {
            if (found) {
                onError(new AlreadyExistsException("MoodActivity " + name + " already exists"));
                return;
            }
            
            try {
                self._open('moodActivities').add({name: name});
            } catch (error) {
                onError(error);
            }
            self.getMoodActivityId(name, onSuccess, onError);
        }, onError);
    },
    /* DataBase::getMoodActivityId(String name, Function onSuccess, Function onError)
     *
     *  On success: onSuccess(id) is called with the Id of the moodActivity
     *  If not found: onError(NotFoundException)
     *  On error: onError(Error)
     */
    getMoodActivityId: function(name, onSuccess, onError) {
        try {
            this._index('moodActivities', 'nameIdx').getKey(name).then(function(key) {
                if (typeof key == "undefined") {
                    onError(new NotFoundException("MoodActivity with name " + name + " doesn't exist"));
                } else {
                    onSuccess(key);
                }
            }, onError);
        } catch (error) {
            onError(error);
        }
    },
    /* DataBase::getMoodActivity(Integer id, Function onSuccess, Function onError)
     *
     *  On success: onSuccess(name) is called with the name of the moodactivity
     *  If not found: onError(NotFoundException)
     *  On error: onError(Error)
     */
    getMoodActivity: function(id, onSuccess, onError) {
        try {
            this._open('moodActivities').get(id).then(function(item) {
                if (typeof item != 'undefined') {
                    onSuccess(item.name);
                } else {
                    onError(new NotFoundException("MoodActivity with id " + id + " doesn't exist"));
                }
            }, onError);
        } catch (error) {
            onError(error);
        }
    },
    /* DataBase::getAllMoodActivities(Function onSuccess, Function onError[, Function map])
     *
     *  On success: onSuccess(activities) is called, with activities an array of the the Activity objects,
     *              unless map is set, then Activity is an array of the result of map.
     *  On error: onError(error) is called
     *  The map function: function(spot) { return activity.name; } results in an array of names.
     */
    getAllMoodActivities: function(onSuccess, onError, map) {
        this._getAll('moodActivities', onSuccess, onError, map);
    },
    /* DataBase::getAllMoodActivitiesNames(Function onSuccess, Function onErorr)
     *
     *  On success: onSuccess(names) is called, with names an array of all names
     *  On error: onErorr(error) is called
     */
    getAllMoodActivitiesNames: function(onSuccess, onError) {
        this.getAllMoodActivities(onSuccess, onError,
            function(spot) {
                return spot.name;
            }
        );
    },
    /* DataBase::iterateMoodActivities(Function iter, Function onSuccess, Function onErorr[, Function map])
     *
     *  On success: onSuccess() is called
     *  On error: onError(error) is called
     *  Each moodactivity: iter(map(activity)) is called, with activity a MoodActivities
     *  If map is not given, map is the identity function
     */
    iterateMoodActivities: function(iter, onSuccess, onError, map) {
        this._iterate('moodActivities', iter, onSuccess, onError, map);
    },
    /* DataBase::iterateMoodActivitiesNames(Function iter, Function onSuccess, Function onErorr)
     *
     *  On success: onSuccess() is called
     *  On error: onError(error) is called
     *  Each moodactivity: iter(activity.name) is called, with activity a MoodActivity
     */
    iterateMoodActivitiesNames: function(iter, onSuccess, onError) {
        this.iterateMoodActivities(iter, onSuccess, onError,
            function(activity) {
                return activity.name;
            }
        );
    },

    /* The MoodEntry object:
     *  (var)                   timestamp:  a timestamp
     *  (id)                    spot:       the id of the location
     *  (id)                    activity:   the id of the activity
     *  (Array<String>)         people:     the people (their names)
     *  (Array<MoodSelection>)  selections: the selection on the wheel
     */

    /* The MoodSelection object:
     *  (float)                 r:          the radius (normalized!)
     *  (float)                 phi:        the angle, in radians
     */

    /* DataBase::addMoodEntry(MoodEntry entry, Function onSuccessm, Function onError)
     *
     * On success: onSuccess() is called
     * On error: onError(error) is called
     */
    addMoodEntry: function(entry, onSuccess, onError) {
        try {
            this._open('moodEntries').add(entry).then(onSuccess, onError);
        } catch (error) {
            onError(error);
        }
    }
    // which getters? (allow to iterate, allow to get all entries of a day ...
});
