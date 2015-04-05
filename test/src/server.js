var fs = require('fs'),
    path = require('path'),
    util = require('util'),
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

    it('initialization', function () {
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

    it('getGuard', function () {
        var server = new Server(options);
        server.getGuard().should.be.ok;
        server.getGuard().should.be.instanceOf(Function);
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
