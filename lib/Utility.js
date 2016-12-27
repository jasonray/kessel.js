const NO_ERROR = null;
module.exports.NO_ERROR = NO_ERROR;

 function isExpired(jobRequest) {
    if (jobRequest.expiration) {
        if (jobRequest.expiration < new Date()) {
            return true;
        }
    }
    return false;
}
module.exports.isExpired = isExpired;

function isDelayed(jobRequest) {
    if (jobRequest.delay) {
        if (jobRequest.delay > new Date()) {
            return true;
        }
    }
    return false;
}
module.exports.isDelayed = isDelayed;
