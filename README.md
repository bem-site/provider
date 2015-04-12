# provider
Data provider web service

[![Coveralls branch](https://img.shields.io/coveralls/bem-site/provider/master.svg)](https://coveralls.io/r/bem-site/provider?branch=master)
[![Travis](https://img.shields.io/travis/bem-site/provider.svg)](https://travis-ci.org/bem-site/provider)
[![David](https://img.shields.io/david/bem-site/provider.svg)](https://david-dm.org/bem-site/provider)
[![David](https://img.shields.io/david/dev/bem-site/provider.svg)](https://david-dm.org/bem-site/provider#info=devDependencies)

![GitHub Logo](./icon-cable.png)

[RUSSIAN DOCUMENTATION](./README.ru.md)

### Installation

* At first you should clone this repository to your local filesystem:
```
$ git clone https://github.com/bem-site/provider.git
```
* Install npm dependencies via `npm install` command
* Run `npm run make` command. It needs for:
    * Install bower dependencies
    * Create bundle
    * Generation of configuration file
    * Generation of stub data

### Configuration

All application configuration is in `configs/config.json` file.

* `title` - application title.
* `path` - full path to operation folder. (required)
* `modelPath` - path to folder which model.json file will be saved to.
* `symlinks` - array with available symlink names (required).
* `logger` - settings for logger module. See [Logger](https://www.npmjs.com/package/bem-site-logger) for more details.
* `logs` - object for log paths in cluster application mode.
* `cluster` - cluster settings. This object should contain field `workers` - the number of server processes in cluster.
* `server` - server setting section. Should contain `port` field which can be simple number of port,
or path to socket file.

### Run

Application can be run in two mods:

* single: `npm start` or `node bin/single.js`
* cluster `npm run cluster` or `node bin/cluster.js`

### Advanced aliases

1. Rebuild bundles via enb tool: `npm run enb` or `enb make --no-cache` 
2. Regenerate stub data: `npm run stub` or `node bin/stub.js`
3. Regenerate configuration file: `npm run config`

## Testing

Run tests:
```
npm run mocha
```

Run tests with istanbul coverage calculation:
```
npm run istanbul
```

Run codestyle verification (jshint and jscs)
```
npm run codestyle
```

Special thanks to:

* Nikolay Ilchenko (http://github.com/tavriaforever)
* Konstantinova Gela (http://github.com/gela-d)

Maintainer @tormozz48
Please send your questions and proposals to: tormozz48@gmail.com
