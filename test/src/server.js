var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    _ = require('lodash'),
    should = require('should'),
    Logger = require('bem-site-logger'),
    master = require('bem-site-snapshot-master'),
    Template = require('../../src/template'),
    Server = require('../../src/server');

describe('src/server.js', function () {
    var options;

    before(function (done) {
        var configPath = path.join(process.cwd(), 'configs/config.json');
        fs.readFile(configPath, { encoding: 'utf-8' }, function (err, config) {
            if (err) {
                throw err;
            } else {
                options = JSON.parse(config);
                done();
            }
        });
    });

    describe('initialization', function () {
        it('error: path was not set', function () {
            var o = _.omit(options, 'path');
            (function () { return new Server(o); }).should.throw('path was not set');
        });

        it('error: model path was not set', function () {
            var o = _.omit(options, 'modelPath');
            (function () { return new Server(o); }).should.throw('model path was not set');
        });

        it('error: server options were not set', function () {
            var o = _.omit(options, 'server');
            (function () { return new Server(o); }).should.throw('server options were not set');
        });

        it ('with Yandex Disk options', function () {
            var o = _.extend({}, options, { 'yandex-disk': {
                    user: 'snapshot.master',
                    password: '112233445566778899',
                    namespace: 'test'
                } }),
                server = new Server(o);
            server._master.should.be.ok;
            server._master.should.be.instanceOf(master.YDisk);
        });

        it ('for development environment', function () {
            process.env['NODE_ENV'] = 'development';
            new Server(options);
            process.env['NODE_ENV'] = 'testing';
        });

        it('success', function () {
            var server = new Server(options);
            server._options.should.be.ok;
            server._options.should.be.instanceOf(Object);

            server._options.path.should.equal(path.resolve(options.path));

            server._logger.should.be.ok;
            server._logger.should.be.instanceOf(Logger);

            server._template.should.be.ok;
            server._template.should.be.instanceOf(Template);

            server._master.should.be.ok;
            server._master.should.be.instanceOf(master.Simple);

            server._server.should.be.ok;
            server._server.should.be.instanceOf(Function);
        });
    });

    it ('getTitle', function () {
        var server = new Server(options);
        server.getTitle().should.be.ok;
        server.getTitle().should.be.instanceOf(String);
        server.getTitle().should.equal(server._options.title);
    });

    it ('getApp', function () {
        var server = new Server(options);
        server.getApp().should.be.ok;
        server.getApp().should.be.instanceOf(Function);
    });

    it('start', function (done) {
        var server = new Server(options);
        server.start(function (err) {
            server.close();
            done(err);
        });
    });
});
