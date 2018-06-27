
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
        this[info['prop']] = flags[flag] || info['default'];
    }

    this.id_type_hash = {}
		this.language_properties = ['label', 'summary']
		this.do_not_traverse = ['metadata', 'structures', '_structures', 'requiredStatement']

		this.all_properties = [
			"label", "metadata", "summary", "thumbnail", "navDate",
			"requiredStatement", "rights", "logo", "value",
			"id", "type", "format", "language", "profile", "timeMode",
			"height", "width", "duration", "viewingDirection", "behavior",
			"homepage", "rendering", "service", "seeAlso", "partOf",
			"start", "includes", "items", "structures", "annotations"]

		this.annotation_properties = [
			"body", "target", "motivation", "source", "selector", "state",
			"stylesheet", "styleClass"
		]

		this.set_properties = [
			"thumbnail", "logo", "behavior",
			"rendering", "service", "seeAlso", "partOf"
		]

		this.object_property_types = {
			"thumbnail": "Image",
			"logo":"Image",
			"homepage": "",
			"rendering": "",
			"seeAlso": "Dataset",
			"partOf": ""
		}

		this.content_type_map = {
			"image": "Image",
			"audio": "Sound",
			"video": "Video",
			"application/pdf": "Text",
			"text/html": "Text",
			"text/plain": "Text",
			"application/xml": "Dataset",
			"text/xml": "Dataset"
    }    

  }

  warn(msg) {
    if (this.debug) {
      console.log(msg)
    }
  }

  retrieve_resource(uri) {
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

	mint_uri() {
    const new_uuid = uuid4();
    return `https://example.org/uuid/${new_uuid}`;
  }

	traverse(what) {
    const p3version = {};
    let v = null;
    let fn = null;
    for (let k in what) {
      v = what[k];
      if (this.language_properties.includes(k)||
          this.do_not_traverse.includes(k)) {
        //also handled by language_map, etc
        p3version[k] = v
        continue;
      } else if (k === 'service') {
        // break service out as it has so many types
        fn = this.process_service
      } else {
        fn = this.process_resource
      }

      if (isDictionary(v)) {
        let keys = Object.keys(v);
        if (!(keys.length == 2 && keys.includes('type') && keys.includes('id'))) {
          p3version[k] = fn(v)
        } else {
          p3version[k] = v 
        }
      } else if (isArray(v)) {
        let p3versionl = []
        v.forEach(i => {
          if (isDictionary(i)) {
            let keys = Object.keys(i);
            if (!(keys.length == 2 && keys.includes('type') && keys.includes('id'))) {
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
      if (
        !this.language_properties.includes(k) && 
        !this.do_not_traverse.includes(k)
      ) {
        this.warn(`Unknown property: ${k}`);
      }
    }
    return p3version
  }

	fix_service_type(what) {
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

	fix_type(what) {
    // Called from process_resource so we can switch
		let t = what['@type'] || '';
    if (t) {
    	if (isArray(t)) {
				if (t.includes('oa:CssStyle')) {
          t = "CssStylesheet";
        } else if (t.includes('cnt:ContentAsText')) {
          t = "TextualBody";
        }
      }
			if (t.startsWith('sc:')) {
        t = t.replace('sc:', '')
      } else if (t.startsWith('oa:')) {
				t = t.replace('oa:', '')
			} else if (t.startsWith('dctypes:')) {
				t = t.replace('dctypes:', '')
			} else if (t.startsWith('iiif:')) {
				// e.g iiif:ImageApiSelector
        t = t.replace('iiif:', '')
      }
			if (t === "Layer") {
        t = "AnnotationCollection"
      }
			else if (t === "AnnotationList") {
        t = "AnnotationPage"
      } else if (t === "cnt:ContentAsText") {
        t = "TextualBody"
      }
			what['type'] = t
      delete what['@type'];
    }
    return what
  }

	do_language_map(value) {
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
					try {
						p3IString[i['@language']].push(i['@value'])
          } catch (e1) {
						try {
							p3IString[i['@language']] = [i['@value']]
            } catch (e2) {
							// Just @value, no @langauge (ucd.ie)
							if (p3IString.hasOwnProperty('@none')) {
								p3IString['@none'].push(i['@value'])
              } else {
                p3IString['@none'] = [i['@value']]
              }
            }
          }
        } else if (isArray(i)) {
					//pass
        } else if (isDictionary(i)) {
					// UCD has just {"@value": ""}
					if (!i.hasOwnProperty('@language')) {
            i['@language'] = '@none'
          }
					try {
            p3IString[i['@language']].append(i['@value'])
          } catch(e3) {
            p3IString[i['@language']] = [i['@value']]
          }
        } else {  
          // string value
					try {
            p3IString[defl].append(i)
          } catch (e4) {
            p3IString[defl] = [i]
          }
        }
      });
    } else {  
      // string value
      p3IString[defl] = [value]
    }
    return p3IString
  }

	fix_languages(what) {
    this.language_properties.forEach(
      p => {
        if (what.hasOwnProperty(p)) {
          try {
            what[p] = this.do_language_map(what[p]);
          } catch (ex) {
            throw ex; /// ??? ehh your pardon?
          }
        }
      }
    );
		if (what.hasOwnProperty('metadata')) {
      what['metadata'] = what['metadata'].map(pair=> {
        return {
          'label': this.do_language_map(pair['label']),
          'value': this.do_language_map(pair['value'])
        };
      });
    }
    return what;
  }

	fix_sets(what) {
    this.set_properties.forEach(
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
  get_head() {
    let request = new XMLHttpRequest();
    request.open('HEAD', uri, false);  // `false` makes the request synchronous
    request.send(null);
    if (request.status === 200) {
      return {
        headers: {
          get: (headerName) => request.getResponseHeader(headerName)
        }
      };
    } else {
      return {
        headers: {
          get: (headerName) => ""
        }
      };
    }
  }

	set_remote_type(what) {
    let h = null;
	  // do a HEAD on the resource and look at Content-Type
    try {
      h = get_head(what['id']);
    } catch (ex) {

    }
		if (h && h.status == 200) {
			ct = h.headers.get('content-type')
			what['format'] = ct  // as we have it...
			ct = ct.toLowercase();
			first = ct.split('/')[0]

			if (this.content_type_map.hasOwnProperty(first)) {
        what['type'] = this.content_type_map[first]
      } else if (this.content_type_map.hasOwnProperty(ct)) {
        what['type'] = this.content_type_map[ct]
      } else if (ct.startsWith("application/json") || 
        ct.startsWith("application/ld+json")) {
        // Try and fetch and look for a type!
				data = this.retrieve_resource(v['id'])
				if (data.hasOwnProperty('type')) {
          what['type'] = data['type']
        } else if (data.hasOwnProperty('@type')) {
					data = this.fix_type(data)
          what['type'] = data['type']
        }
      }
    }		
  }

	fix_object(what, typ) {
		if (!isDictionary(what)) {
      what = {'id': what}
    }
    let  myid = '';

    if (what.hasOwnProperty('id')) {
			myid = what['id']
    } else if (what.hasOwnProperty('@id')) {
      myid = what['@id']
    }

		if (!what.hasOwnProperty('type') && typ) {
      what['type'] = typ
    } else if (!what.hasOwnProperty('type') && myid) {
			if (this.id_type_hash.hasOwnProperty(myid)) {
        what['type'] = this.id_type_hash[myid]
      } else if (this.deref_links) {
        this.set_remote_type(myid)
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
        }

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

  fix_objects(what) {
    for (var p in this.object_property_types) {
      let typ = this.object_property_types[p];
      if (what.hasOwnProperty(p)) {
        //let p3version = []
        if (this.set_properties.includes(p)) {
          // Assumes list :(
          what[p] = what[p].map(v => this.fix_object(v, typ));
        } else {
          what[p] = this.fix_object(what[p], typ);
        }
      }
    }
    return what;
  }

	process_generic(what) {
    // process generic IIIF properties 
		if (what.hasOwnProperty('@id')) {
			what['id'] = what['@id'];
      delete what['@id'];
    } else {
			// Add in id with a vanilla UUID
      what['id'] = this.mint_uri();
    }

		// @type already processed
	  // Now add to id/type hash for lookups
    if (what.hasOwnProperty('id') && 
      what.hasOwnProperty('type')) {
			try {
				this.id_type_hash[what['id']] = what['type']
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
          // fix_languages below will correct these to langMaps
					let licstmt = {"label": this.license_label, "value": l}
					let md = what['metadata'] || []
					md.push(licstmt)
					what['metadata'] = md
        }
      })
      delete what['license']
    }
		if (what.hasOwnProperty('attribution')) {
			let label = this.do_language_map(this.attribution_label)
			let val = this.do_language_map(what['attribution'])
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
		  	// NB this must happen before fix_languages
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
        if (!this.related_is_metadata && rel == rels[0]) {
          // Assume first is homepage, rest to metadata
					if (!isDictionary(rel)) {
            what['homepage'] = {'@id': rel}
          } 
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
				  // NB this must happen before fix_languages
					md.push({
            label: 'Related', 
            value: `<a href="${uri}">${label}</a>`
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

		what = this.fix_languages(what);
		what = this.fix_sets(what);
		what = this.fix_objects(what);
    return what
  }

	process_service(what) {
		what = this.fix_service_type(what)
		// The only thing to traverse is further services
	  // everything else we leave alone
		if (what.hasOwnProperty('service')){
			let ss = what['service']
      if (!isArray(ss)) {
        what['service'] = [ss]
      }
			what['service'] = what['service'].map(
        s => this.process_service(s)
      );
    }
    return what;
  }

	process_collection(what) {
		what = this.process_generic(what)

		if (what.hasOwnProperty('members')) {
			what['items'] = what['members'];
      delete what['members'];
    } else {
      let colls = what['collections'] || [];
      let mfsts = what['manifests'] || [];
			let nl = colls.map(c => {
        if (!isDictionary(c)) {
          return {'id': c, 'type': 'Collection'}
        } else if (!c.hasOwnProperty('type')) {
          c['type'] = 'Collection'
        }
        return c;
      });  
      nl = nl.concat(mfsts.map(m => {
        if (!isDictionary(m)) {
          return {'id': m, 'type': 'Manifest'};
        } else if (m.hasOwnProperty('type')) {
          m['type'] = 'Manifest';
        }
      }))

			if (nl) {
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

	process_manifest(what) {
		what = this.process_generic(what)

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
			let seqs = what['sequences'];
			what['items'] = seqs[0]['canvases'];
			delete what['sequences'];
			if (seqs.length > 1) {
				// Process to ranges
        what['_structures'] = [];
        seqs.forEach(s => {
          // XXX Test here to see if we need to crawl

          let rng = {"id": s['@id'] || this.mint_uri(), "type": "Range"}
          rng['behavior'] = ['sequence'];
          rng['items'] = s['canvases'].map(c => {
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
          this.process_generic(rng);
          what['_structures'].push(rng);
        }) 	
      }
    }
    return what;
  }

	process_range(what) {
		what = this.process_generic(what);

		let members = what['members'] || [];
		if (what.hasOwnProperty('items')) {
      // preconfigured, move right along
      //pass
    } else if (what.hasOwnProperty('members')) {
			let its = what['members'];
			delete what['members'];
			what['items'] = its.map(i => {
        if (isDictionary(i)) {
          // look in id/type hash
          if (this.id_type_hash.hasOwnProperty(i)) {
            return {
              "id": i, 
              "type": this.id_type_hash[i]
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
        if (isDictionary(r)) {
					return {'id': r, 'type': 'Range'};
        } else if (!r.hasOwnProperty('type')) {
          r['type'] = 'Range';
        }
				return r;
      });
				
			let cvs = what['canvases'] || [];
			nl = nl.concat(
        cvs.map(c => {
          if (isDictionary(c)) {
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
			what['supplementary'] = this.process_resource(what['supplementary']);
    }
    return what;
  }


	process_canvas(what) {
		// XXX process otherContent here before generic grabs it
    what = this.process_generic(what);
    if (what.hasOwnProperty('images')) {
      what['items'] = [{
        'type': 'AnnotationPage', 
        'items': what['images'].map(anno=>JSON.parse(JSON.stringify(anno)))
      }]
      delete what['images']
    }
    return what;
  }

	process_layer(what) {
    return this.process_generic(what);
  }

	process_annotationpage(what) {
    what = this.process_generic(what)
		if (what.hasOwnProperty('resources')) {
			what['items'] = what['resources']
      delete what['resources'];
    } else if (!what.hasOwnProperty('items')) {
      what['items'] = []
    }
    return what;
  }

	process_annotationcollection(what) {
    return this.process_generic(what);
  }

  process_annotation(what) {
		what = this.process_generic(what)

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
			ss = what['stylesheet']
			if (isDictionary(ss)) {
				ss['@type'] = 'oa:CssStylesheet'
				if (ss.hasOwnProperty('chars')) {
					ss['value'] = ss['chars']
          delete ss['chars'];
        }
      } else {
				// Just a link
        what['stylesheet'] = {'@id': ss, '@type': 'oa:CssStylesheet'}
      }
    }
    return what;
  }

	process_specificresource(what) {
		what = this.process_generic(what)
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

	process_textualbody(what) {
		if (what.hasOwnProperty('chars')) {
			what['value'] = what['chars']
      delete what['chars'];
    }
    return what;
  }

	process_choice(what) {
		what = this.process_generic(what)

		let newl = [];
		if (what.hasOwnProperty('default')) {
			newl.append(what['default'])
      delete what['default'];
    }
		if (what.hasOwnProperty('item')) {
			v = what['item']
			if (isArray(v)) {
        v = [v]
      }
			newl = newl.concat(v)
      delete what['item'];
    }
		what['items'] = newl
    return what;
  }

	post_process_generic(what) {

		// test known properties of objects for type
		if (what.hasOwnProperty('homepage') && !what['homepage'].hasOwnProperty('type')) {
      what['homepage']['type'] = "Text"
    }

		// drop empty values
    let what2 = {}
    for (let k in what) {
      let v = what[k];
      if (isArray(v)) {
        v = v.filter(vi=>!!vi || vi===0)
      }
      if (v) {
        what2[k] = v
      }
    }
    return what2;
  }

	post_process_manifest(what) {

		what = this.post_process_generic(what);

		// do ranges at this point, after everything else is traversed
    let tops = [];
    let rhash = {};
    let structs = [];
		if (what.hasOwnProperty('structures')) {
			// Need to process from here, to have access to all info
		  // needed to unflatten them
			
			what['structures'].forEach(r => {
				let newStruct = this.fix_type(r);
				newStruct = this.process_range(newStruct);
				rhash[newStruct['id']] = newStruct
        tops.push(newStruct['id']);
      });

      let newits = [];
			what['structures'].forEach(rng => {
				// first try to include our Range items
				
				rng['items'].forEach(child => {
          let c = {}; 
					if (child.hasOwnProperty("@id")) {
						c = this.fix_type(child)
            c = this.process_generic(c)
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
				// if (rng.hasOwnProperty('partOf')) {
        //   console.log('rng.partOf', JSON.stringify(rng.partOf));
				// 	tops.splice(tops.indexOf(rng['id']),1);
				// 	let parid = rng['partOf'][0]['id'];
				// 	delete rng['partOf'];
				// 	let parent = rhash[parid];
				// 	if (parent) {
				// 		// Just drop it on the floor?
				// 		this.warn("Unknown parent range: %s" % parid)
        //   } else {
				// 		// e.g. Harvard has massive duplication of canvases
				// 		// not wrong, but don't need it any more
				// 		rng['items'].forEach(child => {
        //       parent['items'] = parent['items'].filter(
        //         sibling => child['id'] !== sibling['id']
        //       )
        //     })
        //     parent['items'].append(rng)
        //   }
        // }
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

	process_resource(what, top=false) {
    let orig_context = ""
		if (top) {
			// process @context
			orig_context = what["@context"];
			// could be a list with extensions etc
			delete what['@context'];
    }
		// First update types, so we can switch on it
		what = this.fix_type(what);
    let typ = what['type'] || '';
    let typ_lower = typ.toLowerCase();
		let fn = this[`process_${typ_lower}`] || this.process_generic;
		what = fn(what);
		what = this.traverse(what)
		let fn2 = this[`post_process_${typ_lower}`] || this.post_process_generic;
		what = fn2(what);

		if (top) {
			// Add back in the v3 context
			if (isArray(orig_context)) {
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

	process_uri(uri, top=false) {
		let what = this.retrieve_resource(uri);
    return this.process_resource(what, top);
  }

	/*process_cached(fn, top=true) {
		with open(fn, 'r') as fh:
			data = fh.read()
		what = json.loads(data)
    return this.process_resource(what, top)
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


//if __name__ == "__main__":

	


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
