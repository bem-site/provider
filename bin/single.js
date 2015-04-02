var path = require('path'),
    fs = require('fs'),
    Server = require('../src/server'),
    configPath = path.join(process.cwd(), 'configs/config.json'),
    server;

fs.readFile(configPath, { encoding: 'utf-8' }, function (err, config) {
    if (err) {
        throw err;
    } else {
        server = new Server(config);
        server.start();
    }
});
