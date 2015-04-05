var should = require('should'),
    Template = require('../../src/template');

describe('src/template.js', function () {
    var options = { level: 'common', bundle: 'index'},
        template;

    it ('initialized', function () {
        template = new Template(options);

        template._builder.should.be.ok;
        template._targets.should.be.ok;
        template._baseContext.should.be.ok;

        template._targets.should.be.instanceOf(Object);
    });

    it ('rebuild', function (done) {
        template.rebuild().then(function () {
            done();
        }).done();
    });

    describe('execute', function () {
        it ('default', function (done) {
            var ctx = {
                block: 'page',
                view: 'index',
                data: {
                    title: 'test title',
                    versions: []
                }
            };
            template.execute(ctx, { query: {} }).then(function (html) {
                html.should.be.ok;
                html.should.be.instanceOf(String);
                done();
            }).done();
        });

        it ('in development mode', function (done) {
            var ctx = {
                block: 'page',
                view: 'index',
                data: {
                    title: 'test title',
                    versions: []
                }
            };
            process.env['NODE_ENV'] = 'development';
            template.execute(ctx, { query: {} }).then(function (html) {
                html.should.be.ok;
                html.should.be.instanceOf(String);
                process.env['NODE_ENV'] = 'testing';
                done();
            }).done();
        });

        it ('with bemjson __mode', function (done) {
            var ctx = {
                block: 'page',
                view: 'index',
                data: {
                    title: 'test title',
                    versions: []
                }
            };

            template.execute(ctx, { query: { __mode: 'bemjson' } })
                .then(function (html) {
                    html.should.be.ok;
                    html.should.be.instanceOf(String);
                    done();
                })
                .done();
        });
    });
});
