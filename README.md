# IIIF Presentation v2 to v3 converter (Javascript)

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

The library is a direct javascript port of the [IIIF/prezi-2-to-3](https://github.com/IIIF/prezi-2-to-3/), therefore it converts [json-ld](https://json-ld.org/) documents from IIIF Presentation [v2](http://iiif.io/api/presentation/2.1/) to [v3](http://iiif.io/api/presentation/3.0/).

[demo](https://rawgit.com/digirati-co-uk/prezi2to3-js/master/examples/index.html)

## Istallation

Installing via npm:

```
npm install iiif-prezi2to3
```

Installing using yarn:
```
yarn add iiif-prezi2to3
```

## Usage

### Importing

Using with require:
```
var Upgrader = require('iiif-prezi2to3');
```

Using with es6 imports:
```
import Upgrader from 'iiif-prezi2to3';
```

From browser:
```
<script src="https://unpkg.com/iiif-prezi2to3/umd/iiif-prezi2to3.js" type="text/javascript"></script>
```

### Instantiating
Convert javascript JSON:
```
let upgrader = new Upgrader({"deref_links " : false});
```

### Converting

Processing in memory objects:

```
let resultObject = upgrader.processResource(input_manifest, true);
```

Processing urls:
```
let resultObject = upgrader.processUri(uri, true);
```

### Constuctor flags

* `desc_2_md` : The `description` property is not a summary, and hence should be put in as a `metadata` pair. The label generated will be "Description". The default is `true`.
* `related_2_md` : The `related` property is not a homepage, and hence should be put in as a `metadata` pair. The label generated will be "Related". The default is `false` (and hence the property will simply be renamed as homepage)
* `ext_ok` : Should extensions be copied through to the new version. The default is `false`.
* `default_lang` : The default language to use for language maps. The default is `"@none"`.
* `deref_links` : Should links without a `format` property be dereferenced and the HTTP response inspected for the media type? The default is `true`.
* `debug` : Are we in debug mode and should spit out more warnings than normal? The default is `false`

## TODO/Roadmap

* Increase code coverage
* Rewrite tests using JEST
* Drop nwb.
* Add typings.
* Reduce cyclomatic complexity for several functions including:
    * traverse
    * fixServiceType
    * fixType
    * fixObject
    * processGeneric
    * setRemoteType
    * processRange
    * processAnnotation
    * processResource



[build-badge]: https://travis-ci.org/digirati-co-uk/prezi2to3-js.svg?branch=master
[build]: https://travis-ci.org/digirati-co-uk/prezi2to3-js

[npm-badge]: https://badge.fury.io/js/iiif-prezi2to3.svg
[npm]: https://badge.fury.io/js/iiif-prezi2to3

[coveralls-badge]: https://coveralls.io/repos/github/digirati-co-uk/prezi2to3-js/badge.svg?branch=master
[coveralls]: https://coveralls.io/github/digirati-co-uk/prezi2to3-js?branch=master
