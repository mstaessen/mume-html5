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
        
        var self = this;
        var db = undefined;
        var open = function(ver) {
            db = self._db = window.openDatabase(
                // database name
                name,
                // database version
                ver,
                // description
                'MoodSpaces webapp',
                // size (5kB)
                5 * 1024,
                // callback after opening
                function() {
                    app.log('database moodSpaces opened');
                }
            );
        }
        
        try {
            open('');
        } catch (e) {
            if (e == INVALID_STATE_ERR) {
                open('0');
            } else throw(e);
        }
        
        if (db.version == '' || db.version == '0') {
            db.changeVersion(db.version, '1',
                function(tx) {
                    self._createTable(tx, 'moodSpots',
                        [
                            'spotid INTEGER PRIMARY KEY AUTOINCREMENT',
                            'name TEXT UNIQUE NOT NULL',
                            'active BOOLEAN NOT NULL DEFAULT TRUE'
                        ]
                    );
                    self._createTable(tx, 'moodActivities',
                        [
                            'activityid INTEGER PRIMARY KEY AUTOINCREMENT',
                            'name TEXT UNIQUE NOT NULL',
                            'active BOOLEAN NOT NULL DEFAULT TRUE'
                        ]
                    );
                
                    self._createTable(tx, 'moodEntries',
                        [
                            'entryid INTEGER PRIMARY KEY AUTOINCREMENT',
                            'spot INT NOT NULL',
                            'activity INT NOT NULL',
                            'r REAL NOT NULL',
                            'phi REAL NOT NULL',
                            'date INT NOT NULL DEFAULT "0"',
                            'FOREIGN KEY (spot) REFERENCES moodSpots(spotid)',
                            'FOREIGN KEY (activity) REFERENCES moodActivities(activityid)'
                        ]
                    );
                },
                self.error
            );
            
            if (+db.version > 1) {
                db.changeVersion(db.version, '1', function() {
                    app.log("DataBase - Resetting version nb to 1");
                });
            }
        }

    },
    
    /* DataBase::identity(var e)
     *
     *  Returns e
     */
    identity: function(e) {
        return e;
    },
    /* DataBase::error()
     *
     *  Returns Function(Transaction, Error) to give as callback to the websql database.
     */
    error: function() {
        var self = this;
        return function(tx, err) {
            if (tx instanceof Error)
                self.app.error(tx);
            if (err)
                self.app.error(err);
        }
    },
    /* DataBase::doNothing()
     *
     * The null function
     */
    doNothing: function() {
    },
     
    _transaction: function(f) {
        this._db.transaction(f);
    },
    
    /* TODO write comment
     */
    _createTable: function(tx, name, args) {
        var self = this;
        try {
            tx.executeSql(
                // SQL
                'CREATE TABLE IF NOT EXISTS ' + name + ' (' + args.join(', ') + ');',
                // arguments
                [],
                // success callback
                function() {
                    self.app.log("Created table " + name);
                },
                // error callback
                this.error()
            );
        } catch (e) {
            self.app.error(e);
        }
    },
    
    /* TODO write comment
     */
    _select: function(tx, table, columns, where, arguments, onSuccess, onError) {
        if (!columns) {
            columns = '*';
        }
        if (columns.join) {
            columns = columns.join(', ');
        }
        
        if (!arguments) {
            arguments = [];
        }
        if (!onSuccess) {
            onSuccess = this.doNothing;
        }
        if (!onError) {
            onError = this.error();
        }
        
        try {
            tx.executeSql(
                // SQL
                'SELECT ' + columns + ' FROM ' + table + (where ? ' WHERE ' + where : '') + ';',
                // arguments
                arguments,
                // onSuccess
                onSuccess,
                // onError
                onError
            );
        } catch (e) {
            onError(null, e);
        }
    },
    
    /* TODO write comment
     */
    _insert: function(tx, table, columns, values, onSuccess, onError) {
        if (columns.join) {
            columns = columns.join(', ');
        }
        if (values.join) {
            values = '"' + values.join('", "') + '"';
        } else {
            values = '"' + values + '"';
        }
        
        if (!onSuccess) {
            onSuccess = this.doNothing;
        }
        if (!onError) {
            onError = this.error();
        }
        
        try {
            tx.executeSql(
                // SQL
                'INSERT INTO ' + table + ' (' + columns + ') VALUES (' + values + ');',
                // args
                [],
                // onSuccess
                onSuccess,
                // onError
                onError 
            );
        } catch (e) {
            onError(null, e);
        }
    },
    
    /* TODO write comment
     */
    _update: function(tx, table, columns, values, where, args, onSuccess, onError) {
        var tmp;
        if (columns.join) {
            tmp = '';
            for (var idx in columns) {
                tmp += ', ' + columns[idx] + '="' + values[idx] + '"';
            }
            tmp = tmp.substr(2);
        } else {
            tmp = columns + '="' + values + '"';
        }
        
        if (!onSuccess) {
            onSuccess = this.doNothing;
        }
        if (!onError) {
            onError = this.error();
        }
        
        if (!args) {
            args = [];
        }
        
        try {
            tx.executeSql(
                // SQL
                'UPDATE ' + table + ' SET ' + tmp + (where ? ' WHERE ' + where : '') + ';',
                // args
                args,
                // onSuccess
                onSuccess,
                // onError
                onError
            );
        } catch (e) {
            onError(null, e);
        }
    },
    
    
    /* DataBase::_iterate(String table, Function iter, Function onSuccess, Function onError[, Function map])
     *
     *  Internal use only!
     *  On success: onSuccess() is called
     *  On error: onError(error) is called
     *  Each iteration: iter(map(value)) is called with value from the ObjectStore store
     *  Function map: if not set, this function is set to DataBase::identity
     */
    _iterate: function(table, iter, onSuccess, onError, map, columns, where) {
        if (!map) {
            map = this.identity;
        }
        var self = this;
        
        self._transaction(
            function(tx) {
                self._select(
                    // Transaction
                    tx,
                    // Table
                    table,
                    // Columns
                    columns,
                    // where
                    where,
                    // arguments
                    [],
                    // onSuccess
                    function(tx, resultset) {
                        var rows = resultset.rows;
                        
                        var i = 0;
                        while(i < rows.length) {
                            var row = rows.item(i);
                            
                            iter(map(row));

                            i++;
                        }
                        
                        onSuccess();
                    },
                    onError
                );
            }
        );
    },
    /* DataBase::_getAll(String store, Function onSuccess, Function onError[, Function map])
     *
     *  Internal use only!
     *  On success: onSuccess(res) is called, with res the array of all elements in the store
     *  On error: onError(error) is called
     *  Function map: if not set, this function is set to DataBase::identity
     */
    _getAll: function(store, onSuccess, onError, map, columns, where) {
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
                map,
                columns,
                where
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
                self.isActiveMoodSpot(name, 
                    // onSuccess
                    function (active) {
                        if (active) {
                            onError(new AlreadyExistsException("MoodSpot " + name + " already exists"));
                            return;
                        } else {
                            self.activateMoodSpot(name,
                                function() {
                                    self.getMoodSpotId(name, onSuccess, onError);
                                },
                                onError
                            );
                        }
                    },
                    onError
                )
                return;
            }
            
            try {
                self._transaction(function(tx) {
                    self._insert(tx, 'moodSpots', 'name', name,
                        // onSuccess
                        function() {
                            self.getMoodSpotId(name, onSuccess, onError);
                        },
                        // onError
                        function(tx, err) {
                            onError(err);
                        }
                    );
                });
            } catch (error) {
                onError(error);
            }
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
            var self = this;
            self._transaction(
                function(tx) {
                    self._select(
                        // Transaction
                        tx,
                        // Table
                        'moodSpots',
                        // column
                        'spotid AS id',
                        // WHERE
                        'name == "' + name + '"',
                        // arguments
                        null,
                        // onSuccess
                        function (tx, res) {
                            var rows = res.rows;
                            if (rows.length == 0) {
                                onError(new NotFoundException("MoodSpot with name" + name + "doesn't exist"));
                            } else {
                                onSuccess(rows.item(0).id);
                            }
                        },
                        // onError
                        function (tx, err) {
                            onError(err);
                        }
                    );
                }
            );
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
            var self = this;
            self._transaction(
                function(tx) {
                    self._select(
                        // Transaction
                        tx,
                        // Table
                        'moodSpots',
                        // column
                        'name',
                        // WHERE
                        'spotid == "' + id + '"',
                        // arguments
                        null,
                        // onSuccess
                        function (tx, res) {
                            var rows = res.rows;
                            if (rows.length == 0) {
                                onError(new NotFoundException("MoodSpot with id" + id + "doesn't exist"));
                            } else {
                                onSuccess(rows.item(0).name);
                            }
                        },
                        // onError
                        function (tx, err) {
                            onError(err);
                        }
                    );
                }
            );
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
    /* DataBase::renameMoodSpot(Integer id, String newName, Function onSuccess, Function onError)
     *
     * Renames the MoodSpot with the given id.
     *  On success: onSuccess() is called
     *  On error: onError(error) is called
     */
    renameMoodSpot: function(id, newName, onSuccess, onError) {
        var self = this;
        
        this.hasMoodSpot(newName,
            function(found) {
                if (found) {
                    onError(new AlreadyExistsException("MoodSpot " + newName + " already exists"));
                    return;
                }
                
                self._transaction(function(tx) {
                    self._update(
                        // Transaction
                        tx,
                        // Table
                        'moodSpots',
                        // Column(s) to change
                        'name',
                        // The new value(s)
                        newName,
                        // WHERE
                        'spotid = ?',
                        // args
                        [id],
                        // onSuccess
                        function() {
                            onSuccess();
                        },
                        // onError
                        function(tx, err) {
                            onError(err);
                        }
                    );
                });
            }
        )
    },
    /* DataBase::deactivateMoodSpot(var id, Function onSuccess, Function onError)
     *
     *  Deactivates the MoodSpot with (spotid == id) || (name == id)
     *  On success: onSuccess() is called
     *  On error: onError(error) is called
     */
    deactivateMoodSpot: function(id, onSuccess, onError) {
        this.setActiveMoodSpot(id, false, onSuccess, onError);
    },
    /* DataBase::activateMoodSpot(var id, Function onSuccess, Function onError)
     *
     *  Activates the MoodSpot with (spotid == id) || (name == id)
     *  On success: onSuccess() is called
     *  On error: onError(error) is called
     */
    activateMoodSpot: function(id, onSuccess, onError) {
        this.setActiveMoodSpot(id, true, onSuccess, onError);
    },
    /* DataBase::setActiveMoodSpot(var id, boolean active, Function onSuccess, Function onError)
     *
     *  Sets (active = (active?'TRUE':'FALSE') for the MoodSpot with (spotid == id) || (name == id)
     *  On success: onSuccess() is called
     *  On error: onError(error) is called
     */
    setActiveMoodSpot: function(id, active, onSuccess, onError) {
        var self = this;
        
        self._transaction(function(tx) {
            self._update(
                // Transaction
                tx,
                // Table
                'moodSpots',
                // Column to change
                'active',
                // new value
                active ? 'TRUE' : 'FALSE',
                // WHERE
                'name == ? OR spotid = ?',
                // args
                [id, id],
                // onSuccess
                function() {
                    onSuccess();
                },
                // onError
                function(tx, err) {
                    onError(err);
                }
            );
        });
    },
    /* DataBase::isActiveMoodSpot(var id, Function onSuccess, Function onError)
     *
     *  Check if the moodspot with (spotid == id) || (name == id) is active
     *  On success: onSuccess(active) is called, with active a boolean
     *  On error: onError(error) is called
     */
    isActiveMoodSpot: function(id, onSuccess, onError) {
        var self = this;
        
        self._transaction(function(tx) {
            self._select(
                // Transaction
                tx,
                // Table
                'moodSpots',
                // column
                'active',
                // WHERE
                'spotid == ? OR name == ?',
                // args
                [id, id],
                // onSuccess
                function (tx, res) {
                    var rows = res.rows;
                    if (rows.length == 0) {
                        onError(new NotFoundException("MoodSpot with id" + id + "doesn't exist"));
                    } else {
                        onSuccess(rows.item(0).active == 'TRUE');
                    }
                },
                // onError
                function (tx, err) {
                    onError(err);
                }
            );
        });
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
        self.hasMoodActivity(name, function(found, tx) {
            if (found) {
                self.isActiveMoodActivity(name, 
                    // onSuccess
                    function (active) {
                        if (active) {
                            onError(new AlreadyExistsException("MoodActivity " + name + " already exists"));
                            return;
                        } else {
                            self.activateMoodActivity(name,
                                function() {
                                    self.getMoodActivityId(name, onSuccess, onError);
                                },
                                onError
                            );
                        }
                    },
                    onError
                )
                return;
            }
            
            try {
                self._transaction(function(tx) {
                    self._insert(tx, 'moodActivities', 'name', name,
                        // onSuccess
                        function() {
                            self.getMoodActivityId(name, onSuccess, onError);
                        },
                        // onError
                        function(tx, err) {
                            onError(err);
                        }
                    );
                });
            } catch (error) {
                onError(error);
            }
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
            var self = this;
            self._transaction(
                function(tx) {
                    self._select(
                        // Transaction
                        tx,
                        // Table
                        'moodActivities',
                        // column
                        'activityid AS id',
                        // WHERE
                        'name == "' + name + '"',
                        // arguments
                        null,
                        // onSuccess
                        function (tx, res) {
                            var rows = res.rows;
                            if (rows.length == 0) {
                                onError(new NotFoundException("MoodActivity with name" + name + "doesn't exist"));
                            } else {
                                onSuccess(rows.item(0).id);
                            }
                        },
                        // onError
                        function (tx, err) {
                            onError(err);
                        }
                    );
                }
            );
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
            var self = this;
            self._transaction(
                function(tx) {
                    self._select(
                        // Transaction
                        tx,
                        // Table
                        'moodActivities',
                        // column
                        'name',
                        // WHERE
                        'activityid == "' + id + '"',
                        // arguments
                        null,
                        // onSuccess
                        function (tx, res) {
                            var rows = res.rows;
                            if (rows.length == 0) {
                                onError(new NotFoundException("MoodActivity with id" + id + "doesn't exist"));
                            } else {
                                onSuccess(rows.item(0).name);
                            }
                        },
                        // onError
                        function (tx, err) {
                            onError(err);
                        }
                    );
                }
            );
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
    /* DataBase::renameMoodActivity(Integer id, String newName, Function onSuccess, Function onError)
     *
     * Renames the MoodActivity with the given id.
     *  On success: onSuccess() is called
     *  On error: onError(error) is called
     */
    renameMoodActivity: function(id, newName, onSuccess, onError) {
        var self = this;
        
        this.hasMoodActivity(newName,
            function(found) {
                if (found) {
                    onError(new AlreadyExistsException("MoodActivity " + newName + " already exists"));
                    return;
                }
                
                self._transaction(function(tx) {
                    self._update(
                        // Transaction
                        tx,
                        // Table
                        'moodActivities',
                        // Column(s) to change
                        'name',
                        // The new value(s)
                        newName,
                        // WHERE
                        'activityid = ?',
                        // args
                        [id],
                        // onSuccess
                        function() {
                            onSuccess();
                        },
                        // onError
                        function(tx, err) {
                            onError(err);
                        }
                    );
                });
            },
            onError
        )
    },
    /* DataBase::deactivateMoodActivity(var id, Function onSuccess, Function onError)
     *
     *  Activates the MoodActivity with (activityid == id) || (name == id)
     *  On success: onSuccess() is called
     *  On error: onError(error) is called
     */
    deactivateMoodActivity: function(id, onSuccess, onError) {
        this.setActiveMoodActivity(id, false, onSuccess, onError);
    },
    /* DataBase::activateMoodActivity(var id, Function onSuccess, Function onError)
     *
     *  Activates the MoodActivity with (activityid == id) || (name == id)
     *  On success: onSuccess() is called
     *  On error: onError(error) is called
     */
    activateMoodActivity: function(id, onSuccess, onError) {
        this.setActiveMoodActivity(id, true, onSuccess, onError);
    },
    /* DataBase::setActiveMoodActivity(var id, boolean active, Function onSuccess, Function onError)
     *
     *  Sets (active = (active?'TRUE':'FALSE') for the MoodActivity with (activityid == id) || (name == id)
     *  On success: onSuccess() is called
     *  On error: onError(error) is called
     */
    setActiveMoodActivity: function(id, active, onSuccess, onError) {
        var self = this;
        
        self._transaction(function(tx) {
            self._update(
                // Transaction
                tx,
                // Table
                'moodActivities',
                // Column to change
                'active',
                // new value
                active ? 'TRUE' : 'FALSE',
                // WHERE
                'name == ? OR activityid = ?',
                // args
                [id, id],
                // onSuccess
                function() {
                    onSuccess();
                },
                // onError
                function(tx, err) {
                    onError(err);
                }
            );
        });
    },
    /* DataBase::isActiveMoodActivity(var id, Function onSuccess, Function onError)
     *
     *  Check if the moodactivity with (activityid == id) || (name == id) is active
     *  On success: onSuccess(active) is called, with active a boolean
     *  On error: onError(error) is called
     */
    isActiveMoodActivity: function(id, onSuccess, onError) {
        var self = this;
        
        self._transaction(function(tx) {
            self._select(
                // Transaction
                tx,
                // Table
                'moodActivities',
                // column
                'active',
                // WHERE
                'activityid == ? OR name == ?',
                // args
                [id, id],
                // onSuccess
                function (tx, res) {
                    var rows = res.rows;
                    if (rows.length == 0) {
                        onError(new NotFoundException("MoodActivity with id" + id + "doesn't exist"));
                    } else {
                        onSuccess(rows.item(0).active == 'TRUE');
                    }
                },
                // onError
                function (tx, err) {
                    onError(err);
                }
            );
        });
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
        if (!entry.date && entry.timestamp) {
            entry.date = entry.timestamp;
        }
        
        var self = this;
        
        console.log(entry);
        
        try {
            self._transaction(function(tx) {
                self._insert(
                    // Transaction
                    tx,
                    // Table
                    'moodEntries',
                    // columns
                    [
                        'spot',
                        'activity',
                        'r',
                        'phi',
                        'date'
                    ],
                    // values
                    [
                        entry.spot,
                        entry.activity,
                        entry.selections[0].r,
                        entry.selections[0].phi,
                        entry.date
                    ],
                    // onSuccess
                    function() {
                        onSuccess();
                    },
                    // onError
                    function(tx, err) {
                        onError(err);
                    }
                );
            });
        } catch (error) {
            onError(error);
        }
    },
    // which getters? (allow to iterate, allow to get all entries of a day ...
        
    _delete : function() {
        this._db.changeVersion(this._db.version, '',
            function(tx) {
                tx.executeSql('DROP TABLE moodActivities;');
                tx.executeSql('DROP TABLE moodSpots');
                tx.executeSql('DROP TABLE moodEntries');
            },
            this.error
        );
    }
});
