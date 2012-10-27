Error.extend = Class.extend;

function __createSubClassMethod(parent) {
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
		window[name].subClass = __createSubClassMethod(window[name]);
	}
}

Error.subClass = __createSubClassMethod(Error);

Error.subClass("IllegalArgumentException");