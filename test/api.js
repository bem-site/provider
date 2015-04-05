var util = require('util'),
    path = require('path'),
    http = require('http'),
    fs = require('fs'),
    should = require('should'),
    request = require('supertest'),
    Server = require('../src/server');

describe('api', function () {
    var server,
        baseUrl;

    before(function (done) {
        var configPath = path.join(process.cwd(), 'configs/config.json');
        baseUrl = util.format('http://%s:%s', 'localhost', 3000);
        fs.readFile(configPath, { encoding: 'utf-8' }, function (err, config) {
            if (err) {
                throw err;
            } else {
                server = new Server(JSON.parse(config));
                server.start(function (err) {
                    done();
                });
            }
        });
    });

    describe('GET /', function () {
        it('success', function (done) {
            request(server.getApp())
                .get('/')
                .expect(200)
                .end(function (err) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    describe('GET /ping', function () {
        var snapshotName;

        before(function (done) {
            fs.readdir(path.join(__dirname, './test-data/snapshots'), function (err, result) {
                snapshotName = result[0];
                done();
            });
        });

        it('success', function (done) {
            request(server.getApp())
                .get('/ping/testing')
                .expect(200, snapshotName)
                .end(function (err) {
                    if (err) return done(err);
                    done();
                });
        });

        it('error', function (done) {
            request(server.getApp())
                .get('/ping/staging')
                .expect(500)
                .end(function (err) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    describe('GET /data', function () {
        it('success', function (done) {
            request(server.getApp())
                .get('/data/testing')
                .expect(200)
                .end(function (err) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    describe('GET /changes', function () {
        var snapshotName;

        before(function (done) {
            fs.readdir(path.join(__dirname, './test-data/snapshots'), function (err, result) {
                snapshotName = result[0];
                done();
            });
        });

        it('success', function (done) {
            request(server.getApp())
                .get('/changes/' + snapshotName)
                .expect(200)
                .end(function (err) {
                    if (err) return done(err);
                    done();
                });
        });

        it('error', function (done) {
            request(server.getApp())
                .get('/changes/null')
                .expect(500)
                .end(function (err) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    describe('POST /set', function () {
        var snapshotName;

        before(function (done) {
            fs.readdir(path.join(__dirname, './test-data/snapshots'), function (err, result) {
                snapshotName = result[0];
                done();
            });
        });

        it('success', function (done) {
            request(server.getApp())
                .post('/set/testing/' + snapshotName)
                .expect(302)
                .end(function (err) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    describe('POST /remove', function () {
        var snapshotNames;

        before(function (done) {
            fs.readdir(path.join(__dirname, './test-data/snapshots'), function (err, result) {
                snapshotNames = result;
                done();
            });
        });

        it('success', function (done) {
            request(server.getApp())
                .post('/remove/' + snapshotNames[2])
                .expect(302)
                .end(function (err) {
                    if (err) return done(err);
                    done();
                });
        });

        it('error', function (done) {
            request(server.getApp())
                .post('/remove/' + snapshotNames[0])
                .expect(500)
                .end(function (err) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    after(function () {
        server.close();
    });
});
