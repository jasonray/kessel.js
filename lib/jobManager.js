var Queue = require('../lib/queue');


function JobManager(queueadapter) {
    if (!queueadapter) queueadapter = new Queue();
    this.queueadapter = queueadapter;
}

// jobRequest:
//    - job type
//    - priority
//    - delay
//    - expiration
//    - payload

JobManager.prototype.request = function(jobRequest) {
	if (jobRequest && jobRequst.payload) {
    	queue.push(jobRequest.payload);		
	}
};

JobManager.prototype.getNext = function() {
    return queue.pop(n);
};

JobManager.prototype.isEmpty = function() {
    return queue.isEmpty();
};

module.exports = QueueManager;
