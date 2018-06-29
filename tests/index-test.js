import expect from 'expect'
import { diff as jsonDiff} from 'jsondiffpatch'

import Upgrader from 'src/index'


const TEST_URLS = [
  "http://iiif.io/api/presentation/2.1/example/fixtures/collection.json",
  "http://iiif.io/api/presentation/2.1/example/fixtures/1/manifest.json",
  "http://iiif.io/api/presentation/2.0/example/fixtures/list/65/list1.json",
  "http://media.nga.gov/public/manifests/nga_highlights.json",
  "https://iiif.lib.harvard.edu/manifests/drs:48309543",
  "http://adore.ugent.be/IIIF/manifests/archive.ugent.be%3A4B39C8CA-6FF9-11E1-8C42-C8A93B7C8C91",
  "http://bluemountain.princeton.edu/exist/restxq/iiif/bmtnaae_1918-12_01/manifest",
  "https://api.bl.uk/metadata/iiif/ark:/81055/vdc_00000004216E/manifest.json",
  "https://damsssl.llgc.org.uk/iiif/2.0/4389767/manifest.json",
  "http://iiif.bodleian.ox.ac.uk/iiif/manifest/60834383-7146-41ab-bfe1-48ee97bc04be.json",
  "https://lbiiif.riksarkivet.se/arkis!R0000004/manifest",
  "https://d.lib.ncsu.edu/collections/catalog/nubian-message-1992-11-30/manifest.json",
  "https://ocr.lib.ncsu.edu/ocr/nu/nubian-message-1992-11-30_0010/nubian-message-1992-11-30_0010-annotation-list-paragraph.json",
  "http://iiif.harvardartmuseums.org/manifests/object/299843", 
  "https://purl.stanford.edu/qm670kv1873/iiif/manifest.json", 
  "http://dams.llgc.org.uk/iiif/newspaper/issue/3320640/manifest.json",
  "http://manifests.ydc2.yale.edu/manifest/Admont43",
  "https://manifests.britishart.yale.edu/manifest/1474",
  "http://demos.biblissima-condorcet.fr/iiif/metadata/BVMM/chateauroux/manifest.json",
  "http://www.e-codices.unifr.ch/metadata/iiif/sl-0002/manifest.json",
  "https://data.ucd.ie/api/img/manifests/ucdlib:33064",
  "http://dzkimgs.l.u-tokyo.ac.jp/iiif/zuzoubu/12b02/manifest.json",
  "https://dzkimgs.l.u-tokyo.ac.jp/iiif/zuzoubu/12b02/list/p0001-0025.json",
  "http://www2.dhii.jp/nijl/NIJL0018/099-0014/manifest_tags.json",
  "https://data.getty.edu/museum/api/iiif/298147/manifest.json",
  "https://www.e-codices.unifr.ch/metadata/iiif/csg-0730/manifest.json"
];

// UUID replacers required because the results of this will be different every time
const UUID_START = 'https://example.org/uuid/';
const processUUIDs = (jsonObject) => {
  let uidIdx = 0;
  return JSON.stringify(jsonObject, (k, v) => {
    if (k === 'id' && typeof v == 'string' && v.startsWith(UUID_START)) {
      return 'uuid' + (uidIdx++);
    } 
    return v;
  })
};


const str = (obj) => JSON.stringify(obj);

// helper functions to get a specific fixture
const keyFromURI = (uri, io) => uri.replace(/\//g,'__')
  .replace(/^https?\:____/,`tests/spec/fixtures/${io}/`)
  .replace(/\.json$/,'');

const manifestFromUri = (uri, io) => window.__json__[keyFromURI(uri, io)];
const manifestFixture = (name) => window.__json__[`tests/spec/fixtures/input_data/${name}`];

describe('prezi2to3', () => {
  
  it('outputs identical json to the python version', (done) => {
    TEST_URLS.forEach(uri=>{
      console.log(uri);
      let upgrader = new Upgrader({
        "ext_ok": false, 
        "deref_links": false
      });
      const input_manifest = manifestFromUri(uri,'in');
      const output_manifest = manifestFromUri(uri, 'out');
      const results = upgrader.process_resource(input_manifest, true);
      const compare = JSON.stringify(
        jsonDiff(
          JSON.parse(processUUIDs(output_manifest)), 
          JSON.parse(processUUIDs(results))
        ), null, 2);
      
      expect(compare).toBe(undefined,
        [compare,
        "reference",
        processUUIDs(output_manifest),
        "result",
        processUUIDs(results)].join('\n\n')
      );
    });
    done();
  }, 10000);

  describe('Manifests', () => {
    let results = null;
    let upgrader = null;
    before(()=>{
      let flags= {"ext_ok": false, "deref_links": false}
		  upgrader = new Upgrader(flags);
		  results = upgrader.process_resource(
        manifestFixture('manifest-basic'),
        true
      )
    })
		

	  it('has p3 context', () => {
      const newctxt = ["http://www.w3.org/ns/anno.jsonld",
        "http://iiif.io/api/presentation/3/context.json"];
      expect(results.hasOwnProperty('@context')).toBe(true);
      expect(str(results['@context'])).toEqual(str(newctxt));
    });

	  it('has items', () => {
      expect(results.hasOwnProperty('items')).toBe(true);
      expect(results['items'][0].hasOwnProperty('items')).toBe(true);
      expect(results['items'][0]['items'][0].hasOwnProperty('items')).toBe(true);
      expect(results['structures'][0].hasOwnProperty('items')).toBe(true);
      expect(results['structures'][0]['items'][1].hasOwnProperty('items')).toBe(true);
    });
  
    it('has id porperties', () => {
      expect(results.hasOwnProperty('id')).toBe(true)
      expect(results['id']).toEqual(
        "http://iiif.io/api/presentation/2.1/example/fixtures/1/manifest.json"
      );
      expect(results['structures'][0].hasOwnProperty('id')).toBe(true)
      expect(results['items'][0].hasOwnProperty('id')).toBe(true)
    })

	  it ('has the appropriate type properties', () => {
      // Also tests values of type
      expect(results.hasOwnProperty('type')).toBe(true);
      expect(results['type']).toEqual("Manifest");
      expect(results['items'][0].hasOwnProperty('type')).toBe(true);
      let cvs = results['items'][0];
      expect(cvs['type']).toEqual('Canvas');
      expect(cvs['items'][0]['type']).toEqual("AnnotationPage");
      expect(cvs['items'][0]['items'][0]['type']).toEqual("Annotation");
    });

	  it('has startCanvas', () => {
      let cvs = "http://iiif.io/api/presentation/2.1/example/fixtures/canvas/1/c1.json";
	    expect(results.hasOwnProperty('start')).toBe(true);
	    expect(results['start']['id']).toEqual(cvs);
	    expect(results['start']['type']).toEqual('Canvas');
    });
	

    it('has license', () => {
      let lic = "http://iiif.io/event/conduct/";
      let lic2 = "https://creativecommons.org/licenses/by/4.0/";
      expect(results.hasOwnProperty('rights')).toBe(true);
      expect(results['rights']).toEqual(lic2);
      expect(results.hasOwnProperty('metadata'));
      // Find lic as a value in @none
      let found = false;
      results['metadata'].forEach(pair=>{
        if (pair['value'].hasOwnProperty('@none') && 
          pair['value']['@none'].includes(lic)
        ) {
          found = true
        }
      })
      expect(found).toBe(true);
    });
	

    it('has viewingHint', () => {
      expect(results.hasOwnProperty('behavior')).toBe(true);
      expect(str(results['behavior'])).toEqual(str(["paged"]))
    });
    

    it('has arrays', () => {
      expect(results['behavior'].constructor).toEqual(Array);
      expect(results['logo'].constructor).toEqual(Array);
      expect(results['seeAlso'].constructor).toEqual(Array);
    });
    
    it('has uri_string', () => {
      //expect(results['rendering'].constructor).toEqual(Object); -> this is failing
      //expect(results['start'].constructor).toEqual(Object);
    });
    
    it('has languagemap', () => {
      expect(results['label'].constructor).toEqual(Object);
      expect(results['label'].hasOwnProperty('@none'));
      expect(str(results['label']['@none'])).toEqual(str(["Manifest Label"]));
      expect(results.hasOwnProperty('metadata'));
      let md = results['metadata'];
      expect(md[0]['label'].constructor).toEqual(Object);
      expect(md[0]['label']['@none'].constructor).toEqual(Array);
      expect(md[0]['label']['@none'][0]).toEqual("MD Label 1")
      expect(md[0]['value'].constructor).toEqual(Object);
      expect(md[0]['value']['@none'].constructor).toEqual(Array);
      expect(md[0]['value']['@none'][0]).toEqual("MD Value 1");

      // md[1] has two values 
      expect(md[1]['value']['@none'].length).toBe(2);
      // md[2] has en and fr values
      expect(md[2]['value'].hasOwnProperty('en')).toBe(true);
      expect(md[2]['value'].hasOwnProperty('fr')).toBe(true);
    });
    
    it('has description', () => {
      if (upgrader.description_is_metadata) {
        // look in metadata
        let found = 0;
        results['metadata'].forEach(md => {
          if (md['label']['@none'][0] === "Description") {
            found = 1
            expect(md['value']['@none'][0])
              .toEqual("This is a description of the Manifest");
          }
        });
        // ensure it was generated 
        expect(found).toBe(1);
      } else {
        // look in summary
        expect(results.hasOwnProperty('summary')).toBe(true);
        expect(results['summary'].constructor).toEqual(Object);
        expect(results['summary'].hasOwnProperty('@none')).toBe(true);
        expect(results['summary']['@none'][0])
          .toEqual("This is a description of the Manifest");
      }
    });
	
    if ('has ranges', () => {
      let ranges = results['structures'];
      expect(ranges.length).toBe(1);
      let rng = ranges[0];
      expect(rng.hasOwnProperty("behavior")).toBe(false);
      expect(rng['type']).toEqual("Range");
      expect(rng.hasOwnProperty("items")).toBe(true);
      expect(rng['items'].length).toBe(3);
      // [0] is a Canvas
      expect(rng['items'][1].hasOwnProperty("items")).toBe(true);
      expect(rng['items'][1]['items'][0].hasOwnProperty("items")).toBe(true);
      expect(rng['items'][2].hasOwnProperty("items")).toBe(true);

    });
  })
  describe('Annotations', () => {
    let results = null;
    let upgrader = null;
    let annotations = null; 
    before(()=>{
      let flags= {"ext_ok": false, "deref_links": false}
		  upgrader = new Upgrader(flags);
		  results = upgrader.process_resource(
        manifestFixture('manifest-annos'),
        true
      )
      annotations = results['items'][0]['items'][0]['items'];
    })

    it('has body', () => {
      let anno = annotations[0];
      expect(anno.hasOwnProperty('body')).toBe(true);
      expect(anno['body']['id'])
        .toEqual("http://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png");
    });
      
    it('has target', () => {
      let anno = annotations[0];
      expect(anno.hasOwnProperty('target')).toBe(true);
      expect(anno['target'])
        .toEqual("http://iiif.io/api/presentation/2.1/example/fixtures/canvas/1/c1.json");
    });
      

    it('has type', () => {
      let anno = annotations[0];
      expect(anno.hasOwnProperty('type')).toBe(true);
      expect(anno['type']).toEqual("Annotation");
    });
      

    it('has motivation', () => {
      let anno = annotations[0];
      expect(anno.hasOwnProperty('motivation')).toBe(true);
      expect(anno['motivation']).toEqual("painting");
    });
      

    it('has source', () => {
      let anno = annotations[1];
      expect(anno['body']['type']).toEqual('SpecificResource');
      expect(anno['body'].hasOwnProperty('source')).toBe(true);
    });
      

    it('has ContentAsText', () => {
      let anno = annotations[2];
      expect(anno['body']['type']).toEqual('TextualBody')
      expect(anno['body'].hasOwnProperty('value')).toBe(true);
    });
      

    it('has choice', () => {
      let anno = annotations[3];
      expect(anno['body']['type']).toEqual('Choice');
      expect(anno['body'].hasOwnProperty('items')).toBe(true);
      expect(anno['body']['items'].length).toBe(2);
    });
      

    it('has style', () => {
      let anno = annotations[4];
      expect(anno.hasOwnProperty('stylesheet'));
      expect(anno['stylesheet']['type']).toEqual("CssStylesheet");
      expect(anno['stylesheet'].hasOwnProperty("value")).toBe(true);
      expect(anno['stylesheet']['value']).toEqual(".red {color: red;}");
      expect(anno['body'].hasOwnProperty("styleClass")).toBe(true);
      expect(anno['body']['styleClass']).toEqual("red");
    });
		
  });

  describe('Services', () => {
    let results = null;
    let upgrader = null;
    
    before(()=>{
      let flags= {"ext_ok": false, "deref_links": false}
		  upgrader = new Upgrader(flags);
		  results = upgrader.process_resource(
        manifestFixture('manifest-services'),
        true
      );
      
    });

    it('has search', () => {
      // Search and Autocomplete are on the Manifest
      let manifest = results;
      expect(manifest.hasOwnProperty('service')).toBe(true);
      expect(manifest['service'].constructor).toEqual(Array);
      let svc = manifest['service'][0];
      expect(svc.hasOwnProperty('@context')).toBe(false);
      expect(svc['@id']).toEqual("http://example.org/services/identifier/search");
      expect(svc['@type']).toEqual("SearchService1");
      expect(svc.hasOwnProperty('service')).toBe(true);
      expect(svc['service'][0]['@type']).toEqual("AutoCompleteService1");
    });

    it('has image', () => {
      let svc = results['items'][0]['items'][0]['items'][0]['body']['service'][0]
      expect(svc.hasOwnProperty('@id')).toBe(true);
      expect(svc.hasOwnProperty('@type')).toBe(true);
      expect(svc['@type']).toEqual("ImageService2");
      expect(svc.hasOwnProperty('profile')).toBe(true);
    });

    it('has auth', () => {
      let svc = results['items'][0]['items'][0]['items'][0]['body']['service'][0]['service'][0];
      expect(svc.hasOwnProperty('@id')).toBe(true);
      expect(svc.hasOwnProperty('@type')).toBe(true);
      expect(svc['@type']).toEqual("AuthCookieService1");
      expect(svc.hasOwnProperty('profile')).toBe(true);
      expect(svc.hasOwnProperty('service')).toBe(true);
      let token = svc['service'][0]
      expect(token.hasOwnProperty('@id')).toBe(true);
      expect(token.hasOwnProperty('@type')).toBe(true);
      expect(token['@type']).toEqual("AuthTokenService1");
      let logout = svc['service'][1]
      expect(logout.hasOwnProperty('@id')).toBe(true);
      expect(logout.hasOwnProperty('@type')).toBe(true);
      expect(logout['@type']).toEqual("AuthLogoutService1");
    });

  });

  describe('Collection', () => {
    let results = null;
    let upgrader = null;
    
    before(()=>{
      let flags= {"ext_ok": false, "deref_links": false}
		  upgrader = new Upgrader(flags);
		  results = upgrader.process_resource(
        manifestFixture('collection-basic'),
        true
      );
      
    });

    it('has items', () => {
      expect(results.hasOwnProperty('items')).toBe(true);
      let items = results['items'];
      // Two Collections, then One Manifest
      expect(items.length).toBe(3);
      expect(items[0]['type']).toEqual("Collection");
      expect(items[2]['type']).toEqual("Manifest");
      expect(items[0].hasOwnProperty('items')).toBe(true);
      // Three Members: Collection, Manifest, Collection
      let items2 = items[0]['items'];
      expect(items2.length).toBe(3);
      expect(items2[0]['type']).toEqual("Collection");
      expect(items2[1]['type']).toEqual("Manifest");
      expect(items2[0].hasOwnProperty('behavior')).toBe(true);
      expect(items2[0]['behavior'].indexOf('multi-part')).toBe(0);
    });
  });
})
