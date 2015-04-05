var fs = require('fs'),
    util = require('util'),
    path = require('path'),
    vm = require('vm'),

    _ = require('lodash'),
    vow = require('vow'),
    inherit = require('inherit'),
    vowNode = require('vow-node'),
    stringify = require('json-stringify-safe'),
    Builder = require('enb/lib/server/server-middleware'),
    dropRequireCache = require('enb/lib/fs/drop-require-cache'),
    Template;

module.exports = Template = inherit({
    _builder: undefined,
    _targets: undefined,
    _baseContext: undefined,
    _template: undefined,

    __constructor: function (options) {
        this._builder = Builder['createBuilder']({
            cdir: process.cwd(),
            noLog: false
        });
        this._targets = ['bemtree', 'bemhtml'].reduce(function (prev, item) {
            prev[item] = util.format('src/%s.bundles/%s/%s.%s.js',
                options.level, options['bundle'], options['bundle'], item);
            return prev;
        }, {});
        this._baseContext = vm['createContext']({
            console: console,
            Vow: vow
        });
    },

    /**
     * Rebuilds bemtree and bemhtml templates for development environment
     * @returns {*}
     */
    rebuild: function () {
        return vow.all(
            _.values(this._targets).map(function (item) {
                return this._builder(item).then(function () {
                    dropRequireCache(require, item);
                    return item;
                }, this);
            }, this))
            .then(function () {
                this._template = require(path.join(process.cwd(), this._targets['bemhtml']));
                var p = path.join(process.cwd(), this._targets['bemtree']);
                return vowNode.promisify(fs.readFile)(p, { encoding: 'utf-8' });
            }, this)
            .then(function (content) {
                vm['runInNewContext'](content, this._baseContext);
                return this._baseContext;
            }, this);
    },

    /**
     * Recompile bemtree and bemhtml templates (only for development environment)
     * throw context and applies bemtree and bemhtml templates
     * @param {Object} context  -  context for templates
     * @param {Object} request - request object
     * @returns {*}
     */
    execute: function (context, request) {
        var rebuild = process.env['NODE_ENV'] === 'development' ?
            this.rebuild() : vow.resolve(this._baseContext);

        return rebuild
            .then(function () {
                return this._baseContext['BEMTREE'].apply(context);
            }, this)
            .then(function (bemjson) {
                if (request.query['__mode'] === 'bemjson') {
                    return stringify(bemjson, null, 2);
                }
                return this._template['BEMHTML'].apply(bemjson);
            }, this);
    }
});
