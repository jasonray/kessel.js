function Queue() {
    this.data = [];
}

Queue.prototype.push = function (n) {
    this.data.push(n);
};

Queue.prototype.pop = function () {
    var self = this;
    if (self.isEmpty()) {
        return null;
    } else {
        var value = self.data[0];
        self.data = self.data.splice(1);
        return value;
    }
};

Queue.prototype.peek = function () {
    if (this.isEmpty()) {
        return null;
    } else {
        return this.data[0];
    }
};

Queue.prototype.isEmpty = function () {
    return (this.size() === 0);
};

Queue.prototype.size = function () {
    return this.data.length;
};

module.exports = Queue;
