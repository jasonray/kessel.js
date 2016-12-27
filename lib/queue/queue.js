var _ = require('underscore');

function Queue() {
    this.data = [];
}

Queue.prototype.push = function (n, priority) {
    var self = this;

    var entry = {
        payload: n,
        priority: priority
    };

    self.data.push(entry);

    //sort the array
    self.data.sort(comparePriority);

    function comparePriority(a, b) {
        return (a.priority - b.priority);
    }
};

Queue.prototype.pop = function () {
    if (this.isEmpty()) {
        return null;
    } else {
        var entry = this.data[0];
        this.data = this.data.splice(1);
        return entry.payload;
    }
};

Queue.prototype.peek = function () {
    if (this.isEmpty()) {
        return null;
    } else {
        return this.data[0].payload;
    }
};

Queue.prototype.isEmpty = function () {
    return (this.size() === 0);
};

Queue.prototype.size = function () {
    return this.data.length;
};

module.exports = Queue;
