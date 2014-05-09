exports.queue = function() {
	var data = [];

	this.push = function(n) {
		data.push(n);
	};

	this.pop = function() {
		if (this.isEmpty()) {
			return 0;
		} else {
			return data.pop();
		}
	};

	this.peek = function() {
		if (this.isEmpty()) {
			return 0;
		} else {
			return data[internalStack.length - 1];
		}
	};

	this.toString = function() {
		return '[' + data.toString() + ']';
	};

	this.isEmpty = function() {
		return (data.length === 0);
	};

};