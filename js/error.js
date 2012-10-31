Error.extend = Class.extend;

Error.__createSubClassMethod = function(parent) {
	return function(name) {
		window[name] = parent.extend({
			init: function(msg) {
				Error.apply(this, [msg]);
				Error.captureStackTrace(this, window[name]);
			}
		});
		
		window[name].name = name;
		window[name].prototype.name = name;
		window[name].prototype.constructor.name = name;
		window[name].subClass = Error.__createSubClassMethod(window[name]);
	}
}

Error.subClass = Error.__createSubClassMethod(Error);

Error.subClass("IllegalArgumentException");
