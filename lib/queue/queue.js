/*jslint node: true */
"use strict";

class Queue {
    constructor() {
        if (!(this instanceof Queue)) {
            return new Queue();
        }

        this.data = [];
    }

    push(n, priority) {
        const self = this;

        const entry = {
            payload: n,
            priority: priority
        };

        self.data.push(entry);

        //sort the array
        self.data.sort(comparePriority);

        function comparePriority(a, b) {
            return (a.priority - b.priority);
        }
    }

    pop() {
        const self = this;
        if (self.isEmpty()) {
            return null;
        } else {
            const entry = self.data[0];
            self.data = self.data.splice(1);
            return entry.payload;
        }
    }

    peek() {
        const self = this;
        if (self.isEmpty()) {
            return null;
        } else {
            return this.data[0].payload;
        }
    }

    isEmpty() {
        return (this.size() === 0);
    }

    size() {
        return this.data.length;
    }
}


module.exports = Queue;
