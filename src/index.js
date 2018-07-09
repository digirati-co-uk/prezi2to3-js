
//
// IIIF Presentation API version 2 to version 3 upgrader
//

import { v4 as uuid4 } from 'uuid';

const FLAGS = {
  "crawl": {
    "prop": "crawl",
    "default": false,
    "description": "NOT YET IMPLEMENTED. Crawl to linked resources, such as AnnotationLists from a Manifest"
  },
  "desc_2_md": {
    "prop": "description_is_metadata",
    "default": true,
    "description": "If true, then the source's `description` properties will be put into a `metadata` pair.\
         If false, they will be put into `summary`."
  },
  "related_2_md": {
    "prop": "related_is_metadata",
    "default": false,
    "description": "If true, then the `related` resource will go into a `metadata` pair.\
        If false, it will become the `homepage` of the resource."
  },
  "ext_ok": {
    "prop": "ext_ok",
    "default": false,
    "description": "If true, then extensions are allowed and will be copied across. \
        If false, then they will raise an error."
  },
  "default_lang": {
    "prop": "default_lang",
    "default": "@none",
    "description": "The default language to use when adding values to language maps."
  },
  "deref_links": {
    "prop": "deref_links",
    "default": true,
    "description": "If true, the conversion will dereference external content resources to look for format and type."
  },
  "debug": {
    "prop": "debug",
    "default": false,
    "description": "If true, then go into a more verbose debugging mode."
  },
  "attribution_label": {
    "prop": "attribution_label",
    "default": "Attribution",
    "description": "The label to use for requiredStatement mapping from attribution"
  },
  "license_label": {
    "prop": "license_label",
    "default": "Rights/License",
    "description": "The label to use for non-conforming license URIs mapped into metadata"
  }
};

const CONTENT_TYPE_MAP = {
  "image": "Image",
  "audio": "Sound",
  "video": "Video",
  "application/pdf": "Text",
  "text/html": "Text",
  "text/plain": "Text",
  "application/xml": "Dataset",
  "text/xml": "Dataset"
};

const OBJECT_PROPERTY_TYPES = {
  "thumbnail": "Image",
  "logo":"Image",
  "homepage": null,
  "rendering": null,
  "seeAlso": "Dataset",
  "partOf": null
};

const SET_PROPERTIES = [
  "thumbnail", "logo", "behavior",
  "rendering", "service", "seeAlso", "partOf"
];

const ANNOTATION_PROPERTIES = [
  "body", "target", "motivation", "source", "selector", "state",
  "stylesheet", "styleClass"
];

const ALL_PROPERTIES = [
  "label", "metadata", "summary", "thumbnail", "navDate",
  "requiredStatement", "rights", "logo", "value",
  "id", "type", "format", "language", "profile", "timeMode",
  "height", "width", "duration", "viewingDirection", "behavior",
  "homepage", "rendering", "service", "seeAlso", "partOf",
  "start", "includes", "items", "structures", "annotations"]

  
const LANGUAGE_PROPERTIES = ['label', 'summary'];
const DO_NOT_TRAVERSE = ['metadata', 'structures', '_structures', 'requiredStatement'];

const SIMPLE_TYPE_MAP = { 
  "Layer": "AnnotationCollection",
  "AnnotationList": "AnnotationPage",
  "cnt:ContentAsText": "TextualBody"
};

// const KEY_ORDER = [
//     "@context", "id", "@id", "type", "@type", "motivation", "label", "profile",
// 	"format", "language", "value", "metadata", "requiredStatement", "thumbnail",
// 	"homepage", "logo", "rights", "logo", "height", "width", "start",
// 	"viewingDirection", "behavior", "navDate", "rendering", "seeAlso",
//     "partOf",  "includes", "items", "structures", "annotations"
// ];

// const KEY_ORDER_HASH = KEY_ORDER.reduce(
//     (acc, key, idx) => acc[key] = idx,
//     {}
// );

const isArray = (i) => i instanceof Array;
const isDictionary = (i) => i instanceof Object && !(i instanceof Array);

class Upgrader {

  constructor(flags={}) {
    // bind all functions...
    for (let key in this) {
      if (typeof this[key]==='function') {
        this[key] = this[key].bind(this);
      }
    }
    // add properties
    let info = null;
    for (let flag in FLAGS) {
        info = FLAGS[flag]
        this[info['prop']] = flags.hasOwnProperty(flag) ? 
          flags[flag] : 
          info['default'];
    }
    this.idTypeHash = {};
  }

  warn(msg) {
    if (this.debug) {
      console.log(msg);
    }
  }

  retrieveResource(uri) {
    let request = new XMLHttpRequest();
    request.open('GET', uri, false);  // `false` makes the request synchronous
    request.send(null);
    if (request.status === 200) {
      try {
        return JSON.parse(request.responseText);
      } catch (ex) {
        return {};
      }
    } else {
      return {};
    }
  }

  mintURI() {
    const newUUID = uuid4();
    return `https://example.org/uuid/${newUUID}`;
  }

  traverse(what) {
    const p3version = {};
    let v = null;
    let fn = null;
    for (let k in what) {
      v = what[k];
      if (LANGUAGE_PROPERTIES.includes(k)||
          DO_NOT_TRAVERSE.includes(k)) {
        //also handled by language_map, etc
        p3version[k] = v
        continue;
      } else if (k === 'service') {
        // break service out as it has so many types
        fn = this.processService
      } else {
        fn = this.processResource
      }

      if (isDictionary(v)) {
        let keys = Object.keys(v);
        if (!(keys.length === 2 && keys.includes('type') && keys.includes('id'))) {
          p3version[k] = fn(v)
        } else {
          p3version[k] = v
        }
      } else if (isArray(v)) {
        let p3versionl = []
        v.forEach(i => {
          if (isDictionary(i)) {
            let keys = Object.keys(i);
            if (!(keys.length === 2 && keys.includes('type') && keys.includes('id'))) {
              p3versionl.push(fn(i));
            } else {
              p3versionl.push(i);
            }
          } else {
            p3versionl.push(i);
          }
          p3version[k] = p3versionl
        })
      } else {
        p3version[k] = v
      }
      if (!LANGUAGE_PROPERTIES.includes(k) &&
        !DO_NOT_TRAVERSE.includes(k)) {
        this.warn(`Unknown property: ${k}`);
      }
    }
    return p3version
  }

  fixServiceType(what) {
    // manage known service contexts
    if (what.hasOwnProperty('@context')) {
      let ctxt = what['@context']
      if (ctxt === "http://iiif.io/api/image/2/context.json") {
        what['@type'] = "ImageService2";
        delete what['@context'];
        return what;
      } else if (
        ["http://iiif.io/api/image/1/context.json",
        "http://library.stanford.edu/iiif/image-api/1.1/context.json"].includes(ctxt)
      ) {
        what['@type'] = "ImageService1";
        delete what['@context'];
        return what;
      } else if (["http://iiif.io/api/search/1/context.json",
        "http://iiif.io/api/search/0/context.json",
        "http://iiif.io/api/auth/1/context.json",
        "http://iiif.io/api/auth/0/context.json"].includes(ctxt)) {
        // handle below in profiles, but delete context here
        delete what['@context'];
      } else if (ctxt === "http://iiif.io/api/annex/openannotation/context.json") {
        what['@type'] = "ImageApiSelector"
        delete what['@context'];
      } else {
        what['@type'] = "Service";
        this.warn(`Unknown context: ${ctxt}`);
      }
    } else {
      what['@type'] = "Service";
      this.warn('No cotext at all');
    }

    if (what.hasOwnProperty('profile')) {
      // Auth: CookieService1 , TokenService1
      let profile = what['profile']
      if ([
        "http://iiif.io/api/auth/1/kiosk",
        "http://iiif.io/api/auth/1/login",
        "http://iiif.io/api/auth/1/clickthrough",
        "http://iiif.io/api/auth/1/external",
        "http://iiif.io/api/auth/0/kiosk",
        "http://iiif.io/api/auth/0/login",
        "http://iiif.io/api/auth/0/clickthrough",
        "http://iiif.io/api/auth/0/external"
        ].includes(profile)) {
        what['@type'] = 'AuthCookieService1';
        // leave profile alone
      } else if (
        ["http://iiif.io/api/auth/1/token",
        "http://iiif.io/api/auth/0/token"].includes(profile)) {
        what['@type'] = 'AuthTokenService1'
      } else if (
        [
          "http://iiif.io/api/auth/1/logout",
          "http://iiif.io/api/auth/0/logout"
        ].includes(profile)) {
        what['@type'] = 'AuthLogoutService1'
      } else if (
        [
          "http://iiif.io/api/search/1/search",
          "http://iiif.io/api/search/0/search"
        ].includes(profile)) {
        what['@type'] = "SearchService1"
      } else if (
        [
          "http://iiif.io/api/search/1/autocomplete",
          "http://iiif.io/api/search/0/autocomplete"
        ].includes(profile)) {
          what['@type'] = "AutoCompleteService1"
      }
    }

    return what
  }

  fixType(what) {
    // Called from processResource so we can switch
    let t = what['@type'] || '';
    if (t) {
      if (isArray(t)) {
        if (t.includes('oa:CssStyle')) {
          t = "CssStylesheet";
        } else if (t.includes('cnt:ContentAsText')) {
          t = "TextualBody";
        }
      }
      t = t.replace(/^(sc|oa|dctypes|iiif)\:/,'');
      if (SIMPLE_TYPE_MAP.hasOwnProperty(t)) {
        t = SIMPLE_TYPE_MAP[t];
      }
      what['type'] = t
      delete what['@type'];
    }
    return what;
  }

  doLanguageMap(value) {
    // TODO compare this with the original i feel what it does is wrong
    let p3IString = {};
    const defl = this.default_lang;
    if (typeof value === "string") {
      p3IString[defl] = [value]
    } else if (isDictionary(value)) {
      if (!p3IString.hasOwnProperty(value['@language'])) {
        p3IString[value['@language']] = []
      }
      p3IString[value['@language']].push(value['@value']);
    } else if (isArray(value)) {
      value.forEach(i => {
        if (isDictionary(i)) {
          let lang = i['@language'] || '@none';
          
          if (!p3IString.hasOwnProperty(lang)) {
            p3IString[lang] = []
          }
          p3IString[lang].push(i['@value']);
        } else if (isArray(i)) {
          //pass
        } else {
          // string value
          if (!p3IString.hasOwnProperty(defl)) {
            p3IString[defl] = []
          }
          p3IString[defl].push(i);
        }
      });
    } else {
      // string value
      p3IString[defl] = [value]
    }
    return p3IString
  }

  fixLanguages(what) {
    LANGUAGE_PROPERTIES.forEach(
      p => {
        if (what.hasOwnProperty(p)) {
          try {
            what[p] = this.doLanguageMap(what[p]);
          } catch (ex) {
            throw ex; /// ??? ehh your pardon?
          }
        }
      }
    );
    if (what.hasOwnProperty('metadata')) {
      what['metadata'] = what['metadata'].map(pair=> {
        return {
          'label': this.doLanguageMap(pair['label']),
          'value': this.doLanguageMap(pair['value'])
        };
      });
    }
    return what;
  }

  fixSets(what) {
    SET_PROPERTIES.forEach(
      p => {
        if (what.hasOwnProperty(p)) {
          if (!isArray(what[p])) {
            what[p] = [what[p]]
          }
        }
      }
    )
    return what;
  }

  // async get_head(url) {
  //   const head = await fetch(new Request(url, {
  //     method: 'HEAD'
  //   }));
  //   return head;
  // }
  getHeader(uri) {
    let request = new XMLHttpRequest();
    request.open('HEAD', uri, false);  // `false` makes the request synchronous
    request.send(null);
    if (request.status === 200) {
      return {
        headers: {
          get: (headerName) => request.getResponseHeader(headerName)
        },
        status: request.status
      };
    } else {
      return null;
    }
  }

  setRemoteType(what) {
    let h = null;
    // do a HEAD on the resource and look at Content-Type
    try {
      h = this.getHeader(what['id']);
    } catch (ex) {
      
    }
    if (h && h.status == 200) {
      let ct = h.headers.get('content-type')
      what['format'] = ct  // as we have it...
      ct = ct.toLowerCase();
      let first = ct.split('/')[0];

      if (CONTENT_TYPE_MAP.hasOwnProperty(first)) {
        what['type'] = CONTENT_TYPE_MAP[first]
      } else if (CONTENT_TYPE_MAP.hasOwnProperty(ct)) {
        what['type'] = CONTENT_TYPE_MAP[ct]
      } else if (ct.startsWith("application/json") ||
        ct.startsWith("application/ld+json")) {
        // Try and fetch and look for a type!
        let data = this.retrieveResource(what['id'])

        if (data.hasOwnProperty('type')) {
          what['type'] = data['type']
        } else if (data.hasOwnProperty('@type')) {
          data = this.fixType(data)
          what['type'] = data['type']
        }
      }
    }
  }

  fixObject(what, typ) {
    if (!isDictionary(what)) {
      what = {'id': what}
    }
    let  myid = what['id'] || what['@id'] || '';

    if (!what.hasOwnProperty('type') && typ) {
      what['type'] = typ
    } else if (!what.hasOwnProperty('type') && myid) {
      if (this.idTypeHash.hasOwnProperty(myid)) {
        what['type'] = this.idTypeHash[myid]
      } else if (this.deref_links===true) {
        this.setRemoteType(what);
      } else {
        // Try to guess from format
        if (what.hasOwnProperty('format')) {
          if (what['format'].startsWith('image/')) {
            what['type'] = "Image"
          } else if (what['format'].startsWith('video/')) {
            what['type'] = "Video"
          } else if (what['format'].startsWith('audio/')) {
            what['type'] = "Audio"
          } else if (what['format'].startsWith('text/')) {
            what['type'] = "Text"
          } else if (what['format'].startsWith('application/pdf')) {
            what['type'] = "Text"
          }
        }1

        // Try to guess from URI
        if (!what.hasOwnProperty('type') && myid.indexOf('.htm') > -1) {
          what['type'] = "Text"
        } else if (!what.hasOwnProperty('type')) {
          // Failed to set type, but it's required
          // We won't validate because of this
          // pass
        }
      }
    }
    return what
  }

  fixObjects(what) {
    for (var p in OBJECT_PROPERTY_TYPES) {
      let typ = OBJECT_PROPERTY_TYPES[p];
      if (what.hasOwnProperty(p)) {
        if (SET_PROPERTIES.includes(p)) {
          // Assumes list :(
          what[p] = what[p].map(v => this.fixObject(v, typ));
        } else {
          what[p] = this.fixObject(what[p], typ);
        }
      }
    }
    return what;
  }

  processGeneric(what) {
    // process generic IIIF properties
    if (what.hasOwnProperty('@id')) {
      what['id'] = what['@id'];
      delete what['@id'];
    } else {
      // Add in id with a vanilla UUID
      what['id'] = this.mintURI();
    }

    // @type already processed
    // Now add to id/type hash for lookups
    if (what.hasOwnProperty('id') &&
      what.hasOwnProperty('type')) {
      try {
        this.idTypeHash[what['id']] = what['type']
      } catch (e) {
        throw `ValueError: ${what.id}`;
      }
    }

    if (what.hasOwnProperty('license')) {
      // License went from many to single
      // Also requires CC or RSS, otherwise extension
      // Put others into metadata
      let lic = what['license']
      if (!isArray(lic)) {
        lic = [lic]
      }
      let done = false
      lic.forEach(l => {
        if (isDictionary(l)) {
          l = l['@id']
        }
        if (!done &&
          (l.indexOf('creativecommons.org/') > -1 ||
            l.indexOf('rightsstatements.org/') > -1)
        ) {
          // match
          what['rights'] = l
          done = true
        } else {
          // fixLanguages below will correct these to langMaps
          let licstmt = {"label": this.license_label, "value": l}
          let md = what['metadata'] || []
          md.push(licstmt)
          what['metadata'] = md
        }
      })
      delete what['license']
    }
    if (what.hasOwnProperty('attribution')) {
      let label = this.doLanguageMap(this.attribution_label)
      let val = this.doLanguageMap(what['attribution'])
      what['requiredStatement'] = {"label": label, "value": val}
      delete what['attribution']
    }

    if (what.hasOwnProperty('viewingHint')) {
      if (!what.hasOwnProperty('behavior')) {
        what['behavior'] = what['viewingHint']
      } else {
        // will already be a list
        if (isArray(what['viewingHint'])) {
          what['behavior'] = what['behavior'].concat(what['viewingHint'])
        } else {
          what['behavior'].push(what['viewingHint'])
        }
      }
      delete what['viewingHint']
    }
    if (what.hasOwnProperty('description')){
      if (this.description_is_metadata) {
        // Put it in metadata
        let md = what['metadata'] || [];
        // NB this must happen before fixLanguages
        md.push({
          "label": "Description",
          "value": what['description']
        })
        what['metadata'] = md
      } else {
        // rename to summary
        what['summary'] = what['description']
      }
      delete what['description']
    }
    if (what.hasOwnProperty('related')) {
      let rels = what['related']
      if (!isArray(rels)) {
        rels = [rels]
      }
      rels.forEach(rel => {
        if (!this.related_is_metadata && rel === rels[0]) {
          // Assume first is homepage, rest to metadata
          if (!isDictionary(rel)) {
            rel = {'@id': rel}
          }
          what['homepage'] = rel
        } else {
          let uri = '';
          let label = '';
          if (isDictionary(rel)) {
            uri = rel['@id']
            if (rel.hasOwnProperty('label')) {
              label = rel['label']
            }
          } else {
            uri = rel
          }
          let md = what['metadata'] || [];
          // NB this must happen before fixLanguages
          md.push({
            label: 'Related',
            value: '<a href=\'' + uri + '\'>' + label + '</a>'
          })
          what['metadata'] = md
        }
      })
      delete what['related']
    }

    if (what.hasOwnProperty("otherContent")) {
      // otherContent is already AnnotationList, so no need to inject
      what['annotations'] = what['otherContent']
      delete what['otherContent'];
    }

    if (what.hasOwnProperty("within")) {
      what['partOf'] = what['within']
      delete what['within']
    }
    
    what = this.fixLanguages(what);
    what = this.fixSets(what);
    what = this.fixObjects(what);
    
    return what
  }

  processService(what) {
    what = this.fixServiceType(what);
    if (what.hasOwnProperty('@id')) {
      what.id = what['@id'];
      delete what['@id'];
    }
    if (what.hasOwnProperty('@type')) {
      what.type = what['@type'];
      delete what['@type'];
    }
    // The only thing to traverse is further services
    // everything else we leave alone
    if (what.hasOwnProperty('service')){
      let ss = what['service']
      if (!isArray(ss)) {
        what['service'] = [ss]
      }
      what['service'] = what['service'].map(
        s => this.processService(s)
      );
    }
    return what;
  }

  processCollection(what) {
    what = this.processGeneric(what)

    if (what.hasOwnProperty('members')) {
      what['items'] = what['members'];
      delete what['members'];
    } else {
      let colls = (
        what.hasOwnProperty('collections') ? 
          what['collections'] : 
          []
      ).map(c => {
        if (!isDictionary(c)) {
          return {'id': c, 'type': 'Collection'}
        } else if (!c.hasOwnProperty('type')) {
          c['type'] = 'Collection'
        }
        return c;
      });
      let mfsts = (
        what.hasOwnProperty('manifests') ?  
          what['manifests'] : 
          []
      ).map(m => {
        if (!isDictionary(m)) {
          return {'id': m, 'type': 'Manifest'};
        } else if (!m.hasOwnProperty('type')) {
          m['type'] = 'Manifest';
        }
        return m
      });
      let nl = colls.concat(mfsts);
      if (nl.length>0) {
        what['items'] = nl;
      }
    }
    if (what.hasOwnProperty('manifests')) {
      delete what['manifests'];
    }

    if (what.hasOwnProperty('collections')) {
      delete what['collections'];
    }
    return what;
  }

  areSequencesNeeded(what) {
    let sequences = what.sequences;
    let sequencesLength = sequences.length;
    
    // TODO: add flag to not control this feature...
    if (sequencesLength === 0) {
      return false; // never be the case, just to be complete :D
    } else if (sequencesLength > 1) {
      return true;
    } //else if (sequencesLength === 1) { //if we assume that sequencesLength is a positive integer.  {
    
    let isNotDefaultViewingHint = 
      sequences[0].hasOwnProperty('viewingHint') && 
      sequences[0].viewingHint !== 'paged';
    let isNotDefaultViewingDirection = 
      sequences[0].hasOwnProperty('viewingDirection') &&
      sequences[0].viewingDirection !== 'left-to-right';
    let hasMetadata = sequences[0].hasOwnProperty('metadata');
    
    return isNotDefaultViewingHint || isNotDefaultViewingDirection || hasMetadata;
  }

  processManifest(what) {
    what = this.processGeneric(what)

    if (what.hasOwnProperty('startCanvas')) {
      let v = what['startCanvas'];
      if (!isDictionary(v)) {
        what['start'] = {
          'id': v,
          'type': "Canvas"
        }
      } else {
        v['type'] = "Canvas";
        what['start'] = v;
      }
      delete what['startCanvas'];
    }

    // Need to test as might not be top object
    if (what.hasOwnProperty('sequences')) {
      // No more sequences!
      let seqs = what.sequences;
      let keepingSequences = this.areSequencesNeeded(what);
      what.items = seqs[0].canvases;
      delete what['sequences'];
      if (keepingSequences) {
        // Process to ranges
        what['_structures'] = [];
        seqs.forEach(s => {
          // XXX Test here to see if we need to crawl
          let rng = {"id": s['@id'] || this.mintURI(), "type": "Range"}
          rng['behavior'] = ['sequence'];
          rng['items'] = (s['canvases']||[]).map(c => {
            if (isDictionary(c)) {
              return {
                id: c['@id'],
                type: "Canvas"
              };
            } else if (typeof c === "string") {
              return {
                id: c,
                type: "Canvas"
              };
            }
          });

          // Copy other properties and hand off to _generic
          delete s['canvases']
          Object.keys(s).forEach(k=> {
            if (!['@id', '@type'].includes(k)) {
              rng[k] = s[k]
            }
          });
          this.processGeneric(rng);
          what['_structures'].push(rng);
        })
      }
    }
    return what;
  }

  processRange(what) {
    what = this.processGeneric(what);

    if (what.hasOwnProperty('items')) {
      // preconfigured, move right along
      //pass
    } else if (what.hasOwnProperty('members')) {
      let its = what['members'];
      delete what['members'];
      what['items'] = its.map(i => {
        if (!isDictionary(i)) {
          // look in id/type hash
          if (this.idTypeHash.hasOwnProperty(i)) {
            return {
              "id": i,
              "type": this.idTypeHash[i]
            };
          } else {
            return {"id": i};
          }
        } else {
          return i;
        }
      });
    } else {
      let nl = []
      let rngs = what['ranges'] || [];
      nl = rngs.map(r => {
        if (!isDictionary(r)) {
          return {'id': r, 'type': 'Range'};
        } else if (!r.hasOwnProperty('type')) {
          r['type'] = 'Range';
        }
        return r;
      });

      let cvs = what['canvases'] || [];
      nl = nl.concat(
        cvs.map(c => {
          if (!isDictionary(c)) {
            return {'id': c, 'type': 'Canvas'}
          } else if (c.hasOwnProperty('type')) {
            c['type'] = 'Canvas'
          }
          return c;
        })
      );
      what['items'] = nl;
    }

    if (what.hasOwnProperty('canvases') ) {
      delete what['canvases'];
    }
    if (what.hasOwnProperty('ranges')) {
      delete what['ranges'];
    }

    // contentLayer
    if (what.hasOwnProperty('contentLayer')) {
      let v = what['contentLayer'];
      if (isArray(v) && v.length === 1) {
        v = v[0]
      }
      if (!isDictionary(v)) {
        what['supplementary'] = {
          id: v,
          type: "AnnotationCollection"
        }
      } else {
        v['type'] = "AnnotationCollection"
        what['supplementary'] = v
      }
      delete what['contentLayer'];
    }

    // Remove redundant 'top' Range
    if (
      what.hasOwnProperty('behavior') &&
      what['behavior'].hasOwnProperty('top')
    ) {
      what['behavior'].splice(what['behavior'].indexOf('top'), 1);
      // if we're empty, remove it
      if (what['behavior'].length === 0) {
        delete what['behavior'];
      }
    }

    if (what.hasOwnProperty('supplementary')) {
      // single object
      what['supplementary'] = this.processResource(what['supplementary']);
    }
    return what;
  }


  processCanvas(what) {
    // XXX process otherContent here before generic grabs it
    what = this.processGeneric(what);
    if (what.hasOwnProperty('images')) {
      what['items'] = [{
        'type': 'AnnotationPage',
        'items': what['images'].map(anno=>JSON.parse(JSON.stringify(anno)))
      }]
      delete what['images']
    }
    return what;
  }

  processLayer(what) {
    return this.processGeneric(what);
  }

  processAnnotationpage(what) {
    what = this.processGeneric(what)
    if (what.hasOwnProperty('resources')) {
      what['items'] = what['resources']
      delete what['resources'];
    } else if (!what.hasOwnProperty('items')) {
      what['items'] = []
    }
    return what;
  }

  processAnnotationcollection(what) {
    return this.processGeneric(what);
  }

  processAnnotation(what) {
    what = this.processGeneric(what)

    if (what.hasOwnProperty('on')) {
      what['target'] = what['on']
      delete what['on'];
    }

    if (what.hasOwnProperty('resource')) {
      what['body'] = what['resource']
      delete what['resource']
    }

    let m = what['motivation'] || '';
    if (m) {
      if (m.startsWith('sc:')) {
        m = m.replace('sc:', '')
      } else if (m.startsWith('oa:')) {
        m = m.replace('oa:', '')
      }
      what['motivation'] = m
    }

    if (what.hasOwnProperty('stylesheet')) {
      let ss = what['stylesheet']
      if (isDictionary(ss)) {
        ss['@type'] = 'oa:CssStylesheet'
        if (ss.hasOwnProperty('chars')) {
          ss['value'] = ss['chars']
          delete ss['chars'];
        }
      } else {
        // Just a link
        what['stylesheet'] = {
          '@id': ss,
          '@type': 'oa:CssStylesheet'
        };
      }
    }
    return what;
  }

  processSpecificresource(what) {
    what = this.processGeneric(what)
    if (what.hasOwnProperty('full')) {
      // And if not, it's broken...
      what['source'] = what['full']
      delete what['full'];
    }
    if (what.hasOwnProperty('style')) {
      what['styleClass'] = what['style']
      delete what['style'];
    }
    return what;
  }

  processTextualbody(what) {
    if (what.hasOwnProperty('chars')) {
      what['value'] = what['chars']
      delete what['chars'];
    }
    return what;
  }

  processChoice(what) {
    what = this.processGeneric(what)

    let newl = [];
    if (what.hasOwnProperty('default')) {
      newl.push(what['default'])
      delete what['default'];
    }
    if (what.hasOwnProperty('item')) {
      let v = what['item']
      if (isArray(v)) {
        v = [v]
      }
      newl = newl.concat(v)
      delete what['item'];
    }
    what['items'] = newl
    return what;
  }

  postProcessGeneric(what) {

    // test known properties of objects for type
    if (what.hasOwnProperty('homepage') && !what['homepage'].hasOwnProperty('type')) {
      what['homepage']['type'] = "Text"
    }

    // drop empty values
    let what2 = {}
    for (let k in what) {
      let v = what[k];
      if (isArray(v)) {
        v = v.filter(
          vi =>
            !(
              vi.constructor === Object &&
              Object.keys(vi).length === 0
            ) &&
            vi !== undefined &&
            vi !== null
        )
        if (v.length===0) {
          v = false;
        }
      }
      if (v) {
        what2[k] = v
      }
    }
    return what2;
  }

  postProcessManifest(what) {

    what = this.postProcessGeneric(what);

    // do ranges at this point, after everything else is traversed
    let tops = [];
    let rhash = {};
    let structs = [];
    if (what.hasOwnProperty('structures')) {
      // Need to process from here, to have access to all info
      // needed to unflatten them

      what['structures'].forEach(r => {
        let newStruct = this.fixType(r);
        newStruct = this.processRange(newStruct);
        rhash[newStruct['id']] = newStruct
        tops.push(newStruct['id']);
      });

      let newits = [];
      what['structures'].forEach(rng => {
        // first try to include our Range items
        newits = [];
        rng['items'].forEach(child => {
          let c = {};
          if (child.hasOwnProperty("@id")) {
            c = this.fixType(child)
            c = this.processGeneric(c)
          } else {
            c = child;
          }

          if (c['type'] === "Range" && rhash.hasOwnProperty(c['id'])) {


            newits.push(rhash[c['id']])
            delete rhash[c['id']]
            tops.splice(tops.indexOf(c['id']), 1);
          } else {
            newits.push(c);
          }
        })
        rng['items'] = newits;

        // Harvard has a strange within based pattern
        // which will now be mapped to partOf
        if (rng.hasOwnProperty('partOf')) {
          tops.splice(tops.indexOf(rng['id']),1);
          let parid = rng['partOf'][0]['id'];
          delete rng['partOf'];
          let parent = rhash[parid];
          if (!parent) {
        		// Just drop it on the floor?
        		this.warn("Unknown parent range: %s" % parid)
          } else {
        		// e.g. Harvard has massive duplication of canvases
        		// not wrong, but don't need it any more
        		rng['items'].forEach(child => {
              parent['items'] = parent['items'].filter(
                sibling => child['id'] !== sibling['id']
              )
            })
            parent['items'].push(rng)
          }
        }
      })
    }

    if (what.hasOwnProperty('_structures')) {
      structs = what['_structures'];
      delete what['_structures'];
    }
    if (tops.length>0) {
      tops.forEach(t => {
        if (rhash.hasOwnProperty(t)) {
          structs.push(rhash[t])
        }
      })
    }
    if (structs.length>0) {
      what['structures'] = structs
    }
    return what;
  }

  // postProcessService(what) {
  //   console.log('pps', what);
  //   what = this.postProcessGeneric(what);
  //   if (what.hasOwnProperty('@id')) {
  //     what.id = what['@id'];
  //     delete what['@id'];
  //   }
  //   if (what.hasOwnProperty('@type')) {
  //     what.type = what['@type'];
  //     delete what['@type'];
  //   }
  //   return what;
  // }

  processResource(what, top=false) {
    let origContext = ""
    if (top) {
      // process @context
      origContext = what["@context"];
      // could be a list with extensions etc
      delete what['@context'];
    }
    // First update types, so we can switch on it
    what = this.fixType(what);
    let typeCapitalised = (what['type'] || '')
      .split('')
      .map((chr,idx)=> 
        idx===0 ? chr.toUpperCase() : chr.toLowerCase()
      ).join('');
    let fn = this[`process${typeCapitalised}`] || this.processGeneric;
    what = fn(what);
    what = this.traverse(what)
    let fn2 = this[`postProcess${typeCapitalised}`] || this.postProcessGeneric;
    what = fn2(what);
    if (top) {
      // Add back in the v3 context
      if (isArray(origContext)) {
        // XXX process extensions
        // pass
      } else {
        what['@context'] = [
          "http://www.w3.org/ns/anno.jsonld",
          "http://iiif.io/api/presentation/3/context.json"
        ]
      }
    }
    return what
  }

  processUri(uri, top=false) {
    let what = this.retrieveResource(uri);
    return this.processResource(what, top);
  }

  /*process_cached(fn, top=true) {
    with open(fn, 'r') as fh:
      data = fh.read()
    what = json.loads(data)
    return this.processResource(what, top)
  }

  reorder(what) {
    new = {}
    for (k,v) in what.items():
      if type(v) == list:
        nl = []
        for i in v:
          if type(i) == dict:
            nl.append(this.reorder(i))
          else:
            nl.append(i)
        new[k] = nl
      else if (type(v) == dict:
        new[k] = this.reorder(v)
      else:
        new[k] = v
    return OrderedDict(sorted(new.items(), key=lambda x: KEY_ORDER_HASH.get(x[0], 1000)))
  }*/
}


///// TO DO:

// Determine which annotations should be items and which annotations
// -- this is non trivial, but also not common

////// Cardinality Requirements
// Check all presence of all MUSTs in the spec and maybe bail?
// A Collection must have at least one label.
// A Manifest must have at least one label.
// An AnnotationCollection must have at least one label.
// id on Collection, Manifest, Canvas, content, Range,
//    AnnotationCollection, AnnotationPage, Annotation
// type on all
// width+height pair for Canvas, if either
// items all the way down

export default Upgrader;
