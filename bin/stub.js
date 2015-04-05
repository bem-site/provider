var fs = require('fs'),
    path = require('path'),

    _ = require('lodash'),
    moment = require('moment'),
    fsExtra = require('fs-extra'),
    Pather = require('bem-site-snapshot-master/lib/pather'),
    CHANGES = {
        _docs: {
            _added: [
                { title: 'title1', url: 'http://test.url1' },
                { title: null, url: 'http://test.url2' }
            ],
            _modified: [
                { title: 'title3', url: 'http://test.url3' },
                { title: 'title4', url: 'http://test.url4' }
            ],
            _removed: []
        },
        _libraries: {
            _added: [
                { lib: 'bem-core', version: 'v2.6.0' },
                { lib: 'bem-components', version: 'v2.1.0' }
            ],
            _modified: [
                { lib: 'bem-components', version: 'v2.0.0' },
                { lib: 'bem-core', version: 'v2.5.0' }
            ],
            _removed: [
                { lib: 'bem-core', version: 'v2.3.0' }
            ]
        }
    };

fs.readFile('./configs/config.json', { encoding: 'utf-8' }, function (err, config) {
    config = JSON.parse(config);

    console.info('-- create stub data for testing start --');
    var baseFolder = path.resolve(process.cwd(), config.path),
        pather = new Pather(baseFolder),
        snapshotNames = [],
        snapshotsFolder = pather.getSnapshotsDir();

    fsExtra.removeSync(baseFolder);
    fsExtra.mkdirpSync(baseFolder);
    _.chain([3, 1, 4, 5, 2, 8, 7, 9, 11])
        .map(function (item) { return moment()['subtract'](item, 'days'); })
        .map(function (item) {
            var sn = item.format('D:M:YYYY-H:m:s');
            console.log('- snapshot: %s', sn);
            snapshotNames.push(sn);
            return sn;
        })
        .map(function (item) { return pather.getSnapshotDir(item); })
        .map(function (item) { return fsExtra.mkdirpSync(item); })
        .map(function (item, index) { return pather.getSnapshotDataFile(snapshotNames[index]); })
        .map(function (item, index) {
            return fsExtra.writeJSONSync (item, {
                date: snapshotNames[index],
                changes: CHANGES
            });
        })
        .value();

    fs.symlinkSync(path.join(snapshotsFolder, snapshotNames[1]), path.join(baseFolder, 'testing'), 'dir');
    fs.symlinkSync(path.join(snapshotsFolder, snapshotNames[3]), path.join(baseFolder, 'production'), 'dir');
    console.info('-- create stub data for testing end --');
});

