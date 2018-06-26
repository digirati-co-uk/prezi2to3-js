import expect from 'expect'

import Upgrader from 'src/index'

describe('Module template', () => {
  it('nonsense test', () => {
    let upgrader = new Upgrader({
      "ext_ok": false, 
      "deref_links": false
    })
    //results = upgrader.process_cached('tests/input_data/manifest-basic.json')

    //uri = "http://iiif.io/api/presentation/2.1/example/fixtures/collection.json"
    //uri = "http://iiif.io/api/presentation/2.1/example/fixtures/1/manifest.json"
    let uri = "http://iiif.io/api/presentation/2.0/example/fixtures/list/65/list1.json"
    //uri = "http://media.nga.gov/public/manifests/nga_highlights.json"
    //uri = "https://iiif.lib.harvard.edu/manifests/drs:48309543"
    //uri = "http://adore.ugent.be/IIIF/manifests/archive.ugent.be%3A4B39C8CA-6FF9-11E1-8C42-C8A93B7C8C91"
    //uri = "http://bluemountain.princeton.edu/exist/restxq/iiif/bmtnaae_1918-12_01/manifest"
    //uri = "https://api.bl.uk/metadata/iiif/ark:/81055/vdc_00000004216E/manifest.json"
    //uri = "https://damsssl.llgc.org.uk/iiif/2.0/4389767/manifest.json"
    //uri = "http://iiif.bodleian.ox.ac.uk/iiif/manifest/60834383-7146-41ab-bfe1-48ee97bc04be.json"
    //uri = "https://lbiiif.riksarkivet.se/arkis!R0000004/manifest"
    //uri = "https://d.lib.ncsu.edu/collections/catalog/nubian-message-1992-11-30/manifest.json"
    //uri = "https://ocr.lib.ncsu.edu/ocr/nu/nubian-message-1992-11-30_0010/nubian-message-1992-11-30_0010-annotation-list-paragraph.json"
    //uri = "http://iiif.harvardartmuseums.org/manifests/object/299843"
    //uri = "https://purl.stanford.edu/qm670kv1873/iiif/manifest.json"
    //uri = "http://dams.llgc.org.uk/iiif/newspaper/issue/3320640/manifest.json"
    //uri = "http://manifests.ydc2.yale.edu/manifest/Admont43"
    //uri = "https://manifests.britishart.yale.edu/manifest/1474"
    //uri = "http://demos.biblissima-condorcet.fr/iiif/metadata/BVMM/chateauroux/manifest.json"
    //uri = "http://www.e-codices.unifr.ch/metadata/iiif/sl-0002/manifest.json"
    //uri = "https://data.ucd.ie/api/img/manifests/ucdlib:33064"
    //uri = "http://dzkimgs.l.u-tokyo.ac.jp/iiif/zuzoubu/12b02/manifest.json"
    //uri = "https://dzkimgs.l.u-tokyo.ac.jp/iiif/zuzoubu/12b02/list/p0001-0025.json"
    //uri = "http://www2.dhii.jp/nijl/NIJL0018/099-0014/manifest_tags.json"
    //uri = "https://data.getty.edu/museum/api/iiif/298147/manifest.json"
    //uri = "https://www.e-codices.unifr.ch/metadata/iiif/csg-0730/manifest.json"
    
    let results = upgrader.process_uri(uri, true)
    //results = upgrader.process_cached('tests/input_data/manifest-sequences.json')
    //results = upgrader.process_cached('tests/input_data/manifest-services.json')
    //results = upgrader.process_cached('tests/input_data/manifest-basic.json')

    // Now reorder
    //results = upgrader.reorder(results)
    console.log('results', JSON.stringify(results, 2))

    //expect(message).toContain('Welcome to prezi2to3')
    expect(results).toBe(results);
  })
})
