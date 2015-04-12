var fs = require('fs'),
    path = require('path'),
    worker = require('luster'),
    Logger = require('bem-site-logger'),
    Server = require('./server'),

    configPath = path.join(process.cwd(), './configs/_config.json'),
    logger = Logger.createLogger(module),
    server;

if (worker['isWorker']) {
    logger.info('Start worker: %s', worker['wid']);
    fs.readFile(configPath, { encoding: 'utf-8' }, function (err, config) {
        if (err) {
            logger.error('Error occur while opening configuration file %s', configPath);
            throw err;
        } else {
            server = new Server(JSON.parse(config));
            server.start();
        }
    });
}
