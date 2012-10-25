/*
 * This file contains a basic Database Abstraction layer.
 * It can be used as a workaround for the lack of proper support in mobile devices.
 */

var DB = {};
DB.Common = {
	/**
	 * Hash merge(Hash...)
	 * Merges hashes. The next hash overrides keys in the previous one. 
	 * The first Hash will be modified. All other supplied hashes are merged into this one. 
	 */
	merge: function() {
		var len = arguments.length;
		if(len > 0) {
			var subject = arguments[0];
			for(var i = 1; i < len; i++) {
				for(var key in arguments[i]) {
					subject[key] = arguments[i][key];
				}
			}
			return subject;
		}
		return undefined;
	}
};

DB.Database = function(driver) {
	if(typeof driver != "DB.AbstractDriver") {
		throw new DB.InvalidArgumentException();
	}
	this.driver = driver;
};
DB.Database.prototype = {
	executeSQL: function(query, onSuccess, onError) {
		this.driver.executeSQL(query, onSuccess, onError);
	}
};

/****************************
 ****  DATABASE DRIVERS  ****
 ****************************/

/**
 * DB.AbstractDriver is the base class for DB Drivers
 * The default behavior for every method is "throw a DB.NotImplementedException". 
 */
DB.AbstractDriver = function() {};
DB.AbstractDriver.prototype = {
	/**
	 * void executeSQL(String sqlQuery, Function onSuccess, onError)
	 * @param query String
	 * @param onSuccess function(result)
	 * @param onError function(error)
	 */
	executeSQL: function(query, onSuccess, onError) {
		throw new DB.NotImplementedException();
	}
};

/**
 * DB.WebSQLDriver can be used on platforms supporting HTML5's Web SQL
 */
DB.WebSQLDriver = function(dbName, version, description, size) {
	//Database openDatabase(String dbName, String version, String description, int sizeInBytes)
	this.db = openDatabase(dbName, version, description, size);
};
DB.WebSQLDriver.prototype = DB.Common.merge({}, DB.AbstractDriver.prototype, {
	constructor: DB.WebSQLDriver,
	executeSQL: function(query, onSuccess, onError) {
		this.db.transaction(function() {
			tx.executeSql(query);
		});
	}
});

/**
 * DB.IndexedDBDriver can be used on platforms supporting HTML5's IndexedDB
 */
DB.IndexedDBDriver = function() {};
DB.IndexedDBDriver.prototype = DB.Common.merge({}, DB.AbstractDriver.prototype, {
	constructor: DB.IndexedDBDriver
});

/*************************
 ****  DB Exceptions  ****
 *************************/

DB.Exception = function(message) {
	this.message = message;
};
DB.Exception.prototype = {
	getMessage: function() {
		return this.message;
	}
};

DB.NotImplementedException = function(message) {
	DB.Exception.call(this, message || "Not implemented");
};
DB.NotImplementedException.prototype = DB.Common.merge({}, DB.Exception.prototype, {
	constructor: DB.NotImplementedException
});

DB.InvalidArgumentException = function(message) {
	DB.Exception.call(this, message || "Invalid Argument");
};
DB.InvalidArgumentException.prototype = DB.Common.merge({}, DB.Exception.prototype, {
	constructor: DB.InvalidArgumentException
});
