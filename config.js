var nconf = require('nconf');

console.log('loading config');

nconf
    .argv()
    .env()
    .file({
        file: 'config/config.json'
    });


module.exports.getConfig = function(section, overrides) {

}