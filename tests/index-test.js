import expect from 'expect'

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

describe('Module template', () => {
  it('nonsense test', () => {
    let upgrader = new Upgrader({
      "ext_ok": false, 
      "deref_links": false
    })

    TEST_URLS.forEach(uri=>{
      let results = upgrader.process_uri(uri, true);
      console.log('results', JSON.stringify(results, 2));
    })
    //results = upgrader.process_cached('tests/input_data/manifest-basic.json')
    
    
    //results = upgrader.process_cached('tests/input_data/manifest-sequences.json')
    //results = upgrader.process_cached('tests/input_data/manifest-services.json')
    //results = upgrader.process_cached('tests/input_data/manifest-basic.json')

    // Now reorder
    //results = upgrader.reorder(results)
    

    //expect(message).toContain('Welcome to prezi2to3')
    expect(results).toBe(results);
  })
})