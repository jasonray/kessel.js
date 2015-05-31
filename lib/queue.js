exports.queue = function() {
	var data = [];

	this.push = function(n) {
		data.push(n);
		data.push(n);
	};

	this.pop = function() {
		if (this.isEmpty()) {
			return null;
		} else {
			value = data[0];
			data = data.splice(1);
			return value;
		}
	};

	this.peek = function() {
		if (this.isEmpty()) {
			return null;
		} else {
			return data[0];
		}
	};

	this.toString = function() {
		return  data.toString() ;
	};

	this.isEmpty = function() {
		return (data.length === 0);
	};

};