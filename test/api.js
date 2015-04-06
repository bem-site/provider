var util = require('util'),
    path = require('path'),
    http = require('http'),
    zlib = require('zlib'),
    fs = require('fs'),
    should = require('should'),
    request = require('request'),
    supertest = require('supertest'),
    Server = require('../src/server');

describe('api', function () {
    var server,
        baseUrl;

    before(function (done) {
        var configPath = path.join(process.cwd(), 'configs/config.json');
        baseUrl = util.format('http://%s:%s', '127.0.0.1', 3000);
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
            supertest(server.getApp())
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
            supertest(server.getApp())
                .get('/ping/testing')
                .expect(200)
                .end(function (err) {
                    if (err) return done(err);
                    done();
                });
        });

        it('error', function (done) {
            supertest(server.getApp())
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
            supertest(server.getApp())
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
            supertest(server.getApp())
                .get('/changes/' + snapshotName)
                .expect(200)
                .end(function (err) {
                    if (err) return done(err);
                    done();
                });
        });

        it('error', function (done) {
            supertest(server.getApp())
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
            supertest(server.getApp())
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
            supertest(server.getApp())
                .post('/remove/' + snapshotNames[2])
                .expect(302)
                .end(function (err) {
                    if (err) return done(err);
                    done();
                });
        });

        it('error', function (done) {
            supertest(server.getApp())
                .post('/remove/' + snapshotNames[0])
                .expect(500)
                .end(function (err) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    describe('POST /model', function () {
        it ('success', function (done) {
            var modelPath = path.join(__dirname, './test-data/model.json');
            fs['createReadStream'](modelPath)
                .pipe(zlib.createGzip())
                .pipe(request.post('http://127.0.0.1:3000' + '/model'))
                .on('close', function () {
                    fs.existsSync(path.resolve(__dirname, './test-data/model/model.json')).should.equal(true);
                    done();
                })
                .on('end', function () {
                    fs.existsSync(path.resolve(__dirname, './test-data/model/model.json')).should.equal(true);
                    done();
                });
        });
    });

    after(function () {
        server.close();
    });
});
