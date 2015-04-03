var fs = require('fs'),
    util = require('util'),
    express = require('express'),
    st = require('serve-static'),
    cookieParser = require('cookie-parser'),

    _ = require('lodash'),
    inherit = require('inherit'),
    Logger = require('bem-site-logger'),
    master = require('bem-site-snapshot-master'),
    Template = require('./template'),
    Server;

module.exports = Server = inherit({

    _options: undefined,
    _logger: undefined,
    _server: undefined,
    _master: undefined,
    _template: undefined,

    __constructor: function (options) {
        var _this = this;

        this._options = options;
        this._logger = Logger.setOptions(options['logger']).createLogger(module);
        this._template = new Template({ level: 'common', bundle: 'index' });

        this._master = options['yandex-disk'] ?
            new master.YDisk(options) :
            new master.Simple(options);

        this._server = express();
        this._server.set('port', options['server']['port'] || 3000);
        this._server.enable('trust proxy');

        if (process.env['NODE_ENV'] !== 'production') {
            this._server.use(require('enb/lib/server/server-middleware').createMiddleware({
                cdir: process.cwd(),
                noLog: false
            }));
        }

        this._server.use(st(process.cwd()));
        this._server.use(function (req, res, next) {
            _this._logger.info('retrieve request %s', req.path);
            next();
        });
        this._server.use(cookieParser());
        this._server.get('/', this._route.index.bind(this));
        this._server.get('/ping/:environment', this._route.ping.bind(this));
        this._server.get('/data/:environment', this._route.data.bind(this));
        this._server.get('/changes/:version', this._route.changes.bind(this));
        this._server.post('/set/:environment/:version', this.getGuard.bind(this), this._route.set.bind(this));
        this._server.post('/remove/:version', this.getGuard.bind(this), this._route.remove.bind(this));
        this._server.post('/model', this._route.model.bind(this));
    },

    getGuard: function () {
        return function (req, res, next) {
            return next();
        };
    },

    getTitle: function () {
        return this._options.title;
    },

    _route: {

        index: function (req, res) {
            var _this = this,
                context = {
                    title: this.getTitle(),
                    versions: []
                };
            this._master.getSnapshots(function (err, snapshots) {
                if (err) {
                    _this._logger.error(err.message);
                    return res.status(500).end(err.message);
                }

                context.versions = snapshots.map(function (item) {
                    return {
                        date: item,
                        changesUrl: util.format('/changes/%s', item),
                        testingUrl: util.format('/set/testing/%s', item),
                        productionUrl: util.format('/set/production/%s', item),
                        removeUrl: util.format('/remove/%s', item),
                        testing: false,
                        production: false
                    };
                });

                return _this._template.execute(_.extend({ block: 'page', view: 'index' }, { data: context }), req)
                    .then(function (html) { res.status(200).end(html); })
                    .fail(function (err) { res.status(500).end(err); });
            });
        },

        ping: function (req, res) {
            var _this = this,
                environment = req.params['environment'];
            this._logger.info('ping controller action %s with params: %s', req.path, environment);
            this._master.getSnapshotNameForSymlink(environment, function (err, result) {
                if (err) {
                    _this._logger.error(err.message);
                    res.status(500).end(err.message);
                } else {
                    _this._logger.debug('ping action returns result %s', result);
                    res.status(200).end(result);
                }
            });
        },

        data: function (req, res) {
            var _this = this,
                environment = req.params['environment'];
            this._logger.info('data controller action %s with params: %s', req.path, environment);
            this._master.getSnapshotDataForSymlink(environment, res, function (err) {
                err ?
                    _this._logger.error(err.message) :
                    _this._logger.debug('data action success');
            });
        },

        changes: function (req, res) {
            console.log(req);
            console.log(res);
            // TODO implement it
        },

        set: function (req, res) {
            var _this = this,
                environment = req.params['environment'],
                version = req.params.version;

            this._logger.info('set controller action %s with params: %s %s', req.path, environment, version);
            this._master.switchSymlinkToSnapshot(environment, version, function (err) {
                if (err) {
                    _this._logger.error(err.message);
                    res.status(500).end(err.message);
                } else {
                    _this._logger.debug('set action success for %s %s', environment, version);
                    res.redirect(302, '/');
                }
            });
        },

        remove: function (req, res) {
            var _this = this,
                version = req.params.version;
            this._logger.info('remove controller action %s with params: %s', req.path, version);
            this._master.removeSnapshot(version, function (err) {
                if (err) {
                    _this._logger.error(err.message);
                    res.status(500).end(err.message);
                } else {
                    _this._logger.debug('snapshot version %s was removed from filesystem', version);
                    res.redirect(302, '/');
                }
            });
        },

        model: function (req, res) {
            console.log(req);
            console.log(res);
            // TODO implement it
        }
    },

    start: function () {
        var _this = this,
            port = this._server.get('port');
        this._server.listen(port, function () {
            _this._logger.info('Express server listening on port %s', port);
            if (!port.toString().match(/\d{2,4}/)) {
                try {
                    fs.chmod(port, '0777');
                } catch (err) {
                    _this._logger.error('Can\'t chmod 0777 to socket');
                }
            }
        });
    }
});
