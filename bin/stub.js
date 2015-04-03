var fs = require('fs'),
    path = require('path'),
    moment = require('moment'),
    fsExtra = require('fs-extra'),
    Pather = require('bem-site-snapshot-master/lib/pather');

fs.readFile('./configs/config.json', { encoding: 'utf-8' }, function (err, config) {
    config = JSON.parse(config);

    console.info('-- create stub data for testing start --');
    var baseFolder = path.resolve(process.cwd(), config.path),
        pather = new Pather(baseFolder),
        snapshotNames = [],
        snapshotsFolder = pather.getSnapshotsDir();

    fsExtra.removeSync(baseFolder);
    fsExtra.mkdirpSync(baseFolder);
    [3, 1, 4, 5, 2, 8, 7, 9, 11]
        .map(function (item) { return moment()['subtract'](item, 'days'); })
        .map(function (item) {
            var sn = item.format('D:M:YYYY-H:m:s');
            console.log('- snapshot: %s', sn);
            snapshotNames.push(sn);
            return sn;
        })
        .map(function (item) { return path.join(snapshotsFolder, item); })
        .map(function (item) { return fsExtra.mkdirpSync(item); });

    fs.symlinkSync(path.join(snapshotsFolder, snapshotNames[1]), path.join(baseFolder, 'testing'), 'dir');
    fs.symlinkSync(path.join(snapshotsFolder, snapshotNames[3]), path.join(baseFolder, 'production'), 'dir');
    console.info('-- create stub data for testing end --');
});

