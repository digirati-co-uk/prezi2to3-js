# IIIF-prezi2to3

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

The library is a direct javascript port of the [IIIF/prezi-2-to-3](https://github.com/IIIF/prezi-2-to-3/), therefore it converts [json-ld](https://json-ld.org/) documents form IIIF Presentation [v2](http://iiif.io/api/presentation/2.1/) to [v3](http://iiif.io/api/presentation/3.0/).

## Istallation

TODO: publish to npm

Installing via npm:

```
npm install [TODO:package-name]
```

Installing using yarn:
```
yarn add [TODO:package-name]
```

## Usage

### Importing

Using with require:
```
var Upgrader = require('prezi2to3');
```

Using with es6 imports:
```
import Upgrader from 'prezi2to3';
```

### Instantiating
Convert javascript JSON:
```
let upgrader = new Upgrader({"deref_links " : false});
```

### Converting

Processing in memory objects:

```
let resultObject = upgrader.process_resource(input_manifest, true);
```

Processing urls:
```
let resultObject = upgrader.process_uri(uri, true);
```

### Constuctor flags

* `desc_2_md` : The `description` property is not a summary, and hence should be put in as a `metadata` pair. The label generated will be "Description". The default is `true`.
* `related_2_md` : The `related` property is not a homepage, and hence should be put in as a `metadata` pair. The label generated will be "Related". The default is `false` (and hence the property will simply be renamed as homepage)
* `ext_ok` : Should extensions be copied through to the new version. The default is `false`.
* `default_lang` : The default language to use for language maps. The default is `"@none"`.
* `deref_links` : Should links without a `format` property be dereferenced and the HTTP response inspected for the media type? The default is `true`.
* `debug` : Are we in debug mode and should spit out more warnings than normal? The default is `false`


[build-badge]: https://travis-ci.org/digirati-co-uk/prezi2to3-js.svg?branch=master
[build]: https://travis-ci.org/digirati-co-uk/prezi2to3-js

[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/npm-package

[coveralls-badge]: https://img.shields.io/coveralls/user/repo/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/user/repo
