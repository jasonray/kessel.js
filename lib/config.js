var nconf;

var reset = module.exports.reset = function () {
    console.log('config reset');
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

module.exports.getConfig = function (section, overrides, defaults) {
    if (overrides) {
        nconf.merge(section, overrides);

        //TODO: add support for defaults here
        //TODO: add more flexibility for merge.  If consumer specifies an object that IS the section, must merge at root
        // for example, if object is like:
        // {x:1, y:2}
        // merge at section
        // if object is like:
        // { section: {x:1, y:2}}
        // merge at root
    }
    // if (defaults) {
    //     nconf.defaults(section, defaults);
    // }
    return nconf.get(section);
};

reset();