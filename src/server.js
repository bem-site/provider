var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    zlib = require('zlib'),
    express = require('express'),
    st = require('serve-static'),
    cookieParser = require('cookie-parser'),

    _ = require('lodash'),
    vow = require('vow'),
    vowNode = require('vow-node'),
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

        if (!this._options.path) {
            throw new Error('path was not set');
        }

        if (!this._options['modelPath']) {
            throw new Error('model path was not set');
        }

        if (!this._options['server']) {
            throw new Error('server options were not set');
        }

        this._options.path = path.resolve(this._options.path);

        this._master = options['yandex-disk'] ?
            new master.YDisk(options) : // use api with yandex disk
            new master.Simple(options); // use api without yandex disk

        this._server = express();
        this._server.set('port', options['server']['port'] || 3000);
        this._server.enable('trust proxy');

        // add enb server middleware for development environment
        if (process.env['NODE_ENV'] === 'development') {
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
        this._server.post('/set/:environment/:version', this.getGuard(), this._route.set.bind(this));
        this._server.post('/remove/:version', this.getGuard(), this._route.remove.bind(this));
        this._server.post('/model', this._route.model.bind(this));
    },

    /**
     * Returns guard function for data-modifying requests
     * @returns {Function}
     */
    getGuard: function () {
        return function (req, res, next) {
            return next();
        };
    },

    /**
     * Returns configured application title
     * @returns {*}
     */
    getTitle: function () {
        return this._options.title;
    },

    /**
     * Returns express app function
     * @returns {Function}
     */
    getApp: function () {
        return this._server;
    },

    _route: {

        /**
         * Index route for / requests. Returns html page with list of snapshots
         * @param {Object} req - http request object
         * @param {Object} res - http response object
         */
        index: function (req, res) {
            var _this = this;
            this._master.getSnapshots(function (err, snapshots) {
                if (err) {
                    _this._logger.error(err.message);
                    res.status(500);
                    return res.end(err.message);
                }

                var markedSnapshots = _this._options['symlinks'].reduce(function (prev, item) {
                        prev[item] = vowNode.promisify(_this._master.getSnapshotNameForSymlink)
                            .call(_this._master, item);
                        return prev;
                    }, {});

                vow.allResolved(markedSnapshots)
                    .then(function (result) {
                        result = _.chain(result)
                            .pick(function (value) { return value.isFulfilled(); })
                            .mapValues(function (value) { return value.valueOf(); })
                            .mapValues(function (value) { return path.basename(value); })
                            .value();

                        return _.chain(snapshots)
                            .map(function (item) {
                                return {
                                    date: item,
                                    changesUrl: util.format('/changes/%s', item),
                                    removeUrl: util.format('/remove/%s', item)
                                };
                            })
                            .map(function (item) {
                                _this._options['symlinks'].forEach(function (symlink) {
                                    item[symlink + 'Url'] = encodeURI(util.format('/set/%s/%s', symlink, item.date));
                                    item[symlink] = item.date === result[symlink];
                                });
                                return item;
                            })
                            .thru(function (snapshots) {
                                return {
                                    title: _this.getTitle(),
                                    versions: snapshots
                                };
                            })
                            .value();
                    })
                    .then(function (context) {
                        return _this._template.execute(
                            _.extend({ block: 'page', view: 'index' }, { data: context }), req);
                    })
                    .then(function (html) {
                        res.status(200);
                        return res.end(html);
                    })
                    .fail(function (err) {
                        res.status(500);
                        return res.end(err);
                    })
                    .done();
            });
        },

        /**
         * Ping action. Returns string with snapshot name for given environment param
         * @param {Object} req - http request object
         * @param {Object} res - http response object
         */
        ping: function (req, res) {
            var _this = this,
                environment = req.params['environment'];
            this._logger.info('ping controller action %s with params: %s', req.path, environment);
            this._master.getSnapshotNameForSymlink(environment, function (err, result) {
                if (err) {
                    _this._logger.error(err.message);
                    res.status(500);
                    res.end(err.message);
                } else {
                    _this._logger.debug('ping action returns result %s', result);
                    res.status(200);
                    res.end(result);
                }
            });
        },

        /**
         * Data action. Streams snapshot data to response
         * @param {Object} req - http request object
         * @param {Object} res - http response object
         */
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

        /**
         * Index route for /changes/:version requests. Returns html page with list of snapshot changes
         * @param {Object} req - http request object
         * @param {Object} res - http response object
         */
        changes: function (req, res) {
            var _this = this,
                version = req.params.version;
            this._logger.info('changes controller action %s with params: %s', req.path, version);
            this._master.getSnapshotChanges(version, function (err, changes) {
                _this._template
                    .execute(_.extend({ block: 'page', view: 'changes' },
                        { data: _.merge(changes, { title: _this.getTitle() }) }), req)
                    .then(function (html) {
                        res.status(200);
                        return res.end(html);
                    })
                    .fail(function () {
                        res.status(500);
                        return res.end();
                    })
                    .done();
            });
        },

        /**
         * Switches symlinks to snapshot
         * @param {Object} req - http request object
         * @param {Object} res - http response object
         */
        set: function (req, res) {
            var _this = this,
                environment = req.params['environment'],
                version = req.params.version;

            this._logger.info('set controller action %s with params: %s %s', req.path, environment, version);
            this._master.switchSymlinkToSnapshot(environment, version, function (err) {
                if (err) {
                    _this._logger.error(err.message);
                    res.status(500);
                    res.end(err.message);
                } else {
                    _this._logger.debug('set action success for %s %s', environment, version);
                    res.redirect(302, '/');
                }
            });
        },

        /**
         * Removes snapshot by version request param
         * @param {Object} req - http request object
         * @param {Object} res - http response object
         */
        remove: function (req, res) {
            var _this = this,
                version = req.params.version;
            this._logger.info('remove controller action %s with params: %s', req.path, version);
            this._master.removeSnapshot(version, function (err) {
                if (err) {
                    _this._logger.error(err.message);
                    res.status(500);
                    res.end(err.message);
                } else {
                    _this._logger.debug('snapshot version %s was removed from filesystem', version);
                    res.redirect(302, '/');
                }
            });
        },

        /**
         * Receives model file, unzips it and place unzipped file into configured modelPath directory
         * @param {Object} req - http request object
         * @param {Object} res - http response object
         */
        model: function (req, res) {
            var zip = zlib.createGunzip(),
                onSuccess = function () {
                    console.info('new model has been received');
                    res.status(200).send('ok');
                },
                onError = function (err) {
                    console.error('error occur while receiving new model file', module);
                    res.status(500).send('error ' + err);
                };

            req
                .pipe(zip)
                .pipe(fs.createWriteStream(this._options['modelPath']))
                .on('error', onError)
                .on('close', onSuccess)
                .on('end', onSuccess);
        }
    },

    /**
     * Starts express server
     */
    start: function (callback) {
        var _this = this,
            port = this._server.get('port');
        this._template.rebuild().then(function () {
            var server = this._server.listen(port, function (err) {
                _this._logger.info('Express server listening on port %s', port);
                if (!port.toString().match(/\d{2,4}/)) {
                    try {
                        fs.chmod(port, '0777');
                    } catch (err) {
                        _this._logger.error('Can\'t chmod 0777 to socket');
                    }
                }
                callback && callback(err);
            });
            this.close = function () {
                server.close();
            };
        }, this);
    }
});
