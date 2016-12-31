
console.log('loading config');
var nconf = require('nconf');
nconf
    .argv()
    .env()
    .file({
        file: 'config/config.json'
    });

module.exports.nconf = function () {
    return nconf;
};

module.exports.appConfig = function () {
    return nconf.get('');
};

module.exports.getConfig = function (section, overrides) {
    return nconf.get(section);
};