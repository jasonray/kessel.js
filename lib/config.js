var nconf;

var reset = module.exports.reset = function () {
    nconf = require('nconf');
    nconf.reset();
    nconf
        .use('memory')
        .argv()
        .env()
        .file({
            file: 'config/config.json'
        });
};

module.exports.nconf = function () {
    return nconf;
};

module.exports.appConfig = function () {
    return nconf.get('');
};

module.exports.getConfig = function (section, overrides) {
    if (overrides) {
        nconf.merge(section, overrides);
    }
    return nconf.get(section);
};

reset();