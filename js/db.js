/*
 * This file contains a basic Database Abstraction layer.
 * It can be used as a workaround for the lack of proper support in mobile devices.
 */
 
var DB = {};

DB.Common = Class.extend({
	init: function(driver) {
		this.driver = driver;
	},
	executeSql: function(query, onSuccess, onError) {
		this.driver.executeSql(query, onSuccess, onError);
	}
});

/****************************
 ****  DATABASE DRIVERS  ****
 ****************************/

/**
 * DB.AbstractDriver is the base class for DB Drivers
 * The default behavior for every method is "throw a DB.NotImplementedException". 
 */
DB.AbstractDriver = Class.extend({
	init: function() {},
	executeSql: function(query, onSuccess, onError) {
		throw new Exception('AbstractDriver must be extended!');
	}
});

/**
 * DB.WebSQLDriver can be used on platforms supporting HTML5's Web SQL
 */
DB.WebSQLDriver = DB.AbstractDriver.extend({
	init: function(dbName, version, description, size) {
		//Database openDatabase(String dbName, String version, String description, int sizeInBytes)
		this.db = openDatabase(dbName, version, description, size);
	},
	executeSQL: function(query, onSuccess, onError) {
		this.db.transaction(function(tx) {
			tx.executeSql(query);
		});
	}
});

/**
 * DB.IndexedDBDriver can be used on platforms supporting HTML5's IndexedDB
 */
DB.IndexedDBDriver = DB.AbstractDriver.extend({
});
