import expect from 'expect'

import Upgrader from 'src/index'

const TEST_URLS = [
  //"http://iiif.io/api/presentation/2.1/example/fixtures/collection.json",
  //"http://iiif.io/api/presentation/2.1/example/fixtures/1/manifest.json",
  "http://iiif.io/api/presentation/2.0/example/fixtures/list/65/list1.json",
  "http://media.nga.gov/public/manifests/nga_highlights.json",
  "https://iiif.lib.harvard.edu/manifests/drs:48309543",
  "http://adore.ugent.be/IIIF/manifests/archive.ugent.be%3A4B39C8CA-6FF9-11E1-8C42-C8A93B7C8C91",
  "http://bluemountain.princeton.edu/exist/restxq/iiif/bmtnaae_1918-12_01/manifest",
  "https://api.bl.uk/metadata/iiif/ark:/81055/vdc_00000004216E/manifest.json",
  "https://damsssl.llgc.org.uk/iiif/2.0/4389767/manifest.json",
  "http://iiif.bodleian.ox.ac.uk/iiif/manifest/60834383-7146-41ab-bfe1-48ee97bc04be.json",
  //"https://lbiiif.riksarkivet.se/arkis!R0000004/manifest", // -> this was bad request
  "https://d.lib.ncsu.edu/collections/catalog/nubian-message-1992-11-30/manifest.json",
  "https://ocr.lib.ncsu.edu/ocr/nu/nubian-message-1992-11-30_0010/nubian-message-1992-11-30_0010-annotation-list-paragraph.json",
  //"http://iiif.harvardartmuseums.org/manifests/object/299843", // -> this was bad request
  //"https://purl.stanford.edu/qm670kv1873/iiif/manifest.json", // ->  NETWORK_ERR: XMLHttpRequest Exception 101
  "http://dams.llgc.org.uk/iiif/newspaper/issue/3320640/manifest.json",
  "http://manifests.ydc2.yale.edu/manifest/Admont43",
  "https://manifests.britishart.yale.edu/manifest/1474",
  "http://demos.biblissima-condorcet.fr/iiif/metadata/BVMM/chateauroux/manifest.json",
  "http://www.e-codices.unifr.ch/metadata/iiif/sl-0002/manifest.json",
  "https://data.ucd.ie/api/img/manifests/ucdlib:33064",
  //"http://dzkimgs.l.u-tokyo.ac.jp/iiif/zuzoubu/12b02/manifest.json", // -> NETWORK_ERR: XMLHttpRequest Exception 101
  "https://dzkimgs.l.u-tokyo.ac.jp/iiif/zuzoubu/12b02/list/p0001-0025.json",
  "http://www2.dhii.jp/nijl/NIJL0018/099-0014/manifest_tags.json",
  "https://data.getty.edu/museum/api/iiif/298147/manifest.json",
  "https://www.e-codices.unifr.ch/metadata/iiif/csg-0730/manifest.json"
];

const UUID_START = 'https://example.org/uuid/';
const processUUIDs = (jsonObject) => {
  let uidIdx = 0;
  return JSON.stringify(jsonObject, (k, v) => {
    if (k === 'id' && typeof v == 'string' && v.startsWith(UUID_START)) {
      return 'uuid' + (uidIdx++);
    } 
  })
};

describe('prezi2to3', () => {
  
  it('outputs identical json to the python version', (done) => {
    let upgrader = new Upgrader({
      "ext_ok": false, 
      "deref_links": false
    });

    TEST_URLS.forEach(uri=>{
      console.log(uri);
      let input_manifest = uri
         .replace(/\//g,'__')
         .replace(/^https?\:____/,'tests/spec/fixtures/in/')
         .replace(/\.json$/,'');
      let output_manifest = uri
      .replace(/\//g,'__')
      .replace(/^https?\:____/,'tests/spec/fixtures/out/')
      .replace(/\.json$/,'');
      //console.log(input_manifest, window.__json__[input_manifest], window.__json__[output_manifest]);
      let results = upgrader.process_resource(window.__json__[input_manifest], true);
      
      expect(
        processUUIDs(results)
      ).toBe(
        processUUIDs(window.__json__[output_manifest])
      );  
      
    })
    
    done();
  })
})
