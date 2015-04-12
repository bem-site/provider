# provider
Web провайдер для поставки данных для bem сайтов

[![Coveralls branch](https://img.shields.io/coveralls/bem-site/provider/master.svg)](https://coveralls.io/r/bem-site/provider?branch=master)
[![Travis](https://img.shields.io/travis/bem-site/provider.svg)](https://travis-ci.org/bem-site/provider)
[![David](https://img.shields.io/david/bem-site/provider.svg)](https://david-dm.org/bem-site/provider)
[![David](https://img.shields.io/david/dev/bem-site/provider.svg)](https://david-dm.org/bem-site/provider#info=devDependencies)

![GitHub Logo](./icon-cable.png)

[ENGLISH DOCUMENTATION](./README.md)

### Установка

* Необходимо склонировать репозиторий на локальную файловую систему:
```
$ git clone https://github.com/bem-site/provider.git
```
* Установить npm зависимости с помощью команды `npm install`
* Запустить команду `npm run make`. Это необходимо для:
    * Установки bower зависимости
    * Сборки bundle с помощью enb сборщика
    * Генерации конфигурационного файла
    * Генерации тестовых данных

### Настройка

Вся конфигурация приложения находится в сгенерированном файле `configs/_config.json`.

* `title` - название приложения. Отображается в шапке страницы.
* `path` - полный путь к папке с данными. (необходимое поле)
* `modelPath` - путь к папке для сохранения файла model.json.
* `symlinks` - массив с названиями симлинок (необходимое поле).
* `logger` - настройки для модуля логгирования. Более детально про настройки логгирования можно прочитать [Здесь](https://www.npmjs.com/package/bem-site-logger).
* `logs` - объект содержащий пути к файлам логов в режиме работы кластера.
* `cluster` - настройки кластера. Этот объект должен содержать поле `workers`, 
который является числом серверных процессов запущенных в кластере.
* `server` - настройки сервера. Этот объект должен содержать поле `port` который может
быть как числом - номером порта на котором будет запущен сервер, так и путем к файлу сокета.

### Запуск

Приложение может быть запущено в 2-х режимах:

* режим запуска одиночного сервера: `npm start` или `node bin/single.js`
* режим кластера `npm run cluster` или `node bin/cluster.js`

### Дополнительные команды:

1. Пересобрать бандлы с помощью enb: `npm run enb` или `enb make --no-cache` 
2. Сгенерировать тестовые данные: `npm run stub` или `node bin/stub.js`
3. Сгенерировать файл конфига: `npm run config`

## Тестирование

Запуск тестов:
```
npm run mocha
```

Запуск тестов с вычислением покрытия кода тестами с помощью инструмента [istanbul](https://www.npmjs.com/package/istanbul):
```
npm run istanbul
```

Проверка синткасиса кода с помощью jshint и jscs
```
npm run codestyle
```

Особая благодарность за помощь в разработке:

* Ильченко Николай (http://github.com/tavriaforever)
* Константинова Гела (http://github.com/gela-d)

Разработчик Кузнецов Андрей Серргеевич @tormozz48
Вопросы и предложения присылать по адресу: tormozz48@gmail.com
