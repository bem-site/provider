var util = require('util'),
    path = require('path'),
    fsExtra = require('fs-extra'),
    luster = require('luster'),
    Logger = require('bem-site-logger');

fsExtra.readJSON(path.resolve(process.cwd(), './configs/config.json'), function (error, config) {
    if (error) {
        throw new Error('Configuration file can\'t be open or parsed!');
    }

    var logger = Logger.setOptions({
        mode: 'production',
        level: config['logger'].level,
        useDate: false
    }).createLogger(module);

    if (luster['isMaster']) {
        try {
            var socket = config['server']['port'];
            !socket.toString().match(/\d{2,4}/) && fsExtra.removeSync(socket);
        } catch (err) {
            logger.error(err.message);
        }
    }

    function getLogPath (logType) {
        var l = config['logs'],
            logPath = path.resolve((!l || !l[logType]) ? util.format('./logs/%s.log', logType) : l[logType]);
        fsExtra.mkdirpSync(path.dirname(logPath));
        return logPath;
    }

    luster['configure']({
        app: './worker.js',
        workers: config['cluster']['workers'],
        control: {
            forkTimeout: 1000,
            stopTimeout: 1000,
            exitThreshold: 3000,
            allowedSequentialDeaths: 10
        },
        server: {
            port: config['server']['port'] || 3000
        },

        extensions: {
            'luster-log-file': {
                extendConsole: true,
                stdout: getLogPath('output'),
                stderr: getLogPath('error')
            }
        }
    }, true, __dirname).run();
});
