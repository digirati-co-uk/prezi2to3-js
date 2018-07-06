import expect from 'expect'
import { diff as jsonDiff} from 'jsondiffpatch'

import Upgrader from 'src/index'

const manifestFixture = (name) => window.__json__[`tests/spec/fixtures/iiif_in/${name}`];
const clone = (jsonObject) => JSON.parse(JSON.stringify(jsonObject));

const P3_CONTEXT = [
  "http://www.w3.org/ns/anno.jsonld",
  "http://iiif.io/api/presentation/3/context.json"
];

describe('prezi2to3', () => {
  let upgrader = null;
  beforeEach(function () {
    let flags = {"ext_ok": false, "deref_links": false};
    upgrader = new Upgrader(flags);
  });

  it('Test 1 Manifest: Minimum Required Fields', () => {
    const p2Manifest = manifestFixture(1);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 
    //console.log(JSON.stringify(p3Manifest,null, 2))
    expect(p3Manifest.hasOwnProperty('label')).toBe(true);
    expect(p3Manifest.label.constructor).toEqual(Object);
    expect(p3Manifest.label.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.label['@none'].constructor).toEqual(Array);
    expect(p3Manifest.hasOwnProperty('type')).toBe(true);
    expect(p3Manifest.type.constructor).toEqual(String);
    expect(p3Manifest.hasOwnProperty('id')).toBe(true);
    expect(p3Manifest.id.constructor).toEqual(String);
    expect(p3Manifest.id).toBe(p2Manifest['@id']);
    expect(p3Manifest.hasOwnProperty('partOf')).toBe(true);
    expect(p3Manifest.partOf.constructor).toEqual(Array);
    //expect(p3Manifest.partOf[0].id).toBe(p2Manifest.within); -> currently failing
    //expect(p3Manifest.partOf[0].type).toBe("Collection"); -> currently failing
    // in presentation v3 items will be always an array
    expect(p3Manifest.hasOwnProperty('items')).toBe(true);
    expect(p3Manifest.items.constructor).toEqual(Array);
    expect(p3Manifest.items.length).toBe(1);
    expect(p3Manifest.items[0].hasOwnProperty('type')).toBe(true);
    expect(p3Manifest.items[0].type).toBe("Canvas");
    expect(p3Manifest.items[0].id).toBe(p2Manifest.sequences[0].canvases[0]['@id']);
    expect(p3Manifest.items[0].hasOwnProperty('width')).toBe(true);
    expect(p3Manifest.items[0].width.constructor).toEqual(Number);
    expect(p3Manifest.items[0].hasOwnProperty('height')).toBe(true);
    expect(p3Manifest.items[0].height.constructor).toEqual(Number);
    expect(p3Manifest.items[0].label.constructor).toEqual(Object);
    expect(p3Manifest.items[0].label.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.items[0].label['@none'].constructor).toEqual(Array);
    expect(p3Manifest.items[0].hasOwnProperty('label')).toBe(true);
    expect(p3Manifest.items[0].items.constructor).toEqual(Array);
    expect(p3Manifest.items[0].items.length).toBe(1);
    expect(p3Manifest.items[0].items[0].hasOwnProperty('type')).toBe(true);
    expect(p3Manifest.items[0].items[0].type).toBe("AnnotationPage");
    expect(p3Manifest.items[0].items[0].items.constructor).toEqual(Array);
    expect(p3Manifest.items[0].items[0].items.length).toBe(1);
    expect(p3Manifest.items[0].items[0].items[0].hasOwnProperty('id')).toBe(true);
    expect(p3Manifest.items[0].items[0].items[0].hasOwnProperty('type')).toBe(true);
    expect(p3Manifest.items[0].items[0].items[0].type).toBe("Annotation")
    expect(p3Manifest.items[0].items[0].items[0].hasOwnProperty('motivation')).toBe(true);
    expect(p3Manifest.items[0].items[0].items[0].motivation).toBe("painting");
    expect(p3Manifest.items[0].items[0].items[0].hasOwnProperty('target')).toBe(true);
    expect(p3Manifest.items[0].items[0].items[0].target).toBe(p3Manifest.items[0].id);
    expect(p3Manifest.items[0].items[0].items[0].target).toBe(p2Manifest.sequences[0].canvases[0].images[0]['on']);
    expect(p3Manifest.items[0].items[0].items[0].hasOwnProperty('body')).toBe(true);
    expect(p3Manifest.items[0].items[0].items[0].body.constructor).toEqual(Object);
    expect(p3Manifest.items[0].items[0].items[0].body.hasOwnProperty('id')).toBe(true);
    expect(p3Manifest.items[0].items[0].items[0].body.id.constructor).toEqual(String);
    expect(p3Manifest.items[0].items[0].items[0].body.hasOwnProperty('type')).toBe(true);
    expect(p3Manifest.items[0].items[0].items[0].body.type.constructor).toEqual(String);
    expect(p3Manifest.items[0].items[0].items[0].body.hasOwnProperty('width')).toBe(true);
    expect(p3Manifest.items[0].items[0].items[0].body.width.constructor).toEqual(Number);
    expect(p3Manifest.items[0].items[0].items[0].body.hasOwnProperty('height')).toBe(true);
    expect(p3Manifest.items[0].items[0].items[0].body.height.constructor).toEqual(Number);
  });
  
  it('Test 2 Manifest: Metadata Pairs', () => {
    const p2Manifest = manifestFixture(2);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('metadata')).toBe(true);
    expect(p3Manifest.metadata.constructor).toEqual(Array);
    expect(p3Manifest.metadata.length).toBe(1);
    expect(p3Manifest.metadata[0].constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].hasOwnProperty('label')).toBe(true);
    expect(p3Manifest.metadata[0].label.constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].label.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.metadata[0].label['@none'].constructor).toEqual(Array);
    expect(p3Manifest.metadata[0].label['@none'].length).toBe(1);
    expect(p3Manifest.metadata[0].label['@none'][0]).toBe(p2Manifest['metadata'][0].label);
    expect(p3Manifest.metadata[0].hasOwnProperty('value')).toBe(true);
    expect(p3Manifest.metadata[0].value.constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].value.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.metadata[0].value['@none'].constructor).toEqual(Array);
    expect(p3Manifest.metadata[0].value['@none'].length).toBe(1);
    expect(p3Manifest.metadata[0].value['@none'][0]).toBe(p2Manifest['metadata'][0].value);
  });
  
  it('Test 3 Manifest: Metadata Pairs with Languages', () => {
    const p2Manifest = manifestFixture(3);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2));
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('metadata')).toBe(true);
    expect(p3Manifest.metadata.constructor).toEqual(Array);
    expect(p3Manifest.metadata.length).toBe(1);
    expect(p3Manifest.metadata[0].constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].hasOwnProperty('label')).toBe(true);
    expect(p3Manifest.metadata[0].label.constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].label.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.metadata[0].label['@none'].constructor).toEqual(Array);
    expect(p3Manifest.metadata[0].label['@none'].length).toBe(1);
    expect(p3Manifest.metadata[0].label['@none'][0]).toBe(p2Manifest['metadata'][0].label);
    expect(p3Manifest.metadata[0].hasOwnProperty('value')).toBe(true);
    expect(p3Manifest.metadata[0].value.constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].value.hasOwnProperty('fr')).toBe(true);
    expect(p3Manifest.metadata[0].value['fr'].constructor).toEqual(Array);
    expect(p3Manifest.metadata[0].value['fr'].length).toBe(1);
    expect(p3Manifest.metadata[0].value['fr'][0]).toBe(p2Manifest['metadata'][0].value[0]['@value']);
    expect(p3Manifest.metadata[0].value.hasOwnProperty('en')).toBe(true);
    expect(p3Manifest.metadata[0].value['en'].constructor).toEqual(Array);
    expect(p3Manifest.metadata[0].value['en'].length).toBe(1);
    expect(p3Manifest.metadata[0].value['en'][0]).toBe(p2Manifest['metadata'][0].value[1]['@value']);

    //
  });
  
  it('Test 4 Manifest: Metadata Pairs with Multiple Values in same Language', () => {
    const p2Manifest = manifestFixture(4);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('metadata')).toBe(true);
    expect(p3Manifest.metadata.constructor).toEqual(Array);
    expect(p3Manifest.metadata.length).toBe(1);
    expect(p3Manifest.metadata[0].constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].hasOwnProperty('label')).toBe(true);
    expect(p3Manifest.metadata[0].label.constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].label.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.metadata[0].label['@none'].constructor).toEqual(Array);
    expect(p3Manifest.metadata[0].label['@none'].length).toBe(1);
    expect(p3Manifest.metadata[0].label['@none'][0]).toBe(p2Manifest['metadata'][0].label);
    expect(p3Manifest.metadata[0].hasOwnProperty('value')).toBe(true);
    expect(p3Manifest.metadata[0].value.constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].value.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.metadata[0].value['@none'].constructor).toEqual(Array);
    expect(p3Manifest.metadata[0].value['@none'].length).toBe(2);
    expect(p3Manifest.metadata[0].value['@none'][0]).toBe(p2Manifest['metadata'][0].value[0]);
    expect(p3Manifest.metadata[0].value['@none'][1]).toBe(p2Manifest['metadata'][0].value[1]);
  });
  
  it('Test 5 Manifest: Description field', () => {
    // NOTE: is description transformed to be summary or stays in metadata?
    const p2Manifest = manifestFixture(5);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));

    expect(p3Manifest.hasOwnProperty('metadata')).toBe(true);
    expect(p3Manifest.metadata.constructor).toEqual(Array);
    expect(p3Manifest.metadata.length).toBe(1);
    expect(p3Manifest.metadata[0].constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].hasOwnProperty('label')).toBe(true);
    expect(p3Manifest.metadata[0].label.constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].label.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.metadata[0].label['@none'].constructor).toEqual(Array);
    expect(p3Manifest.metadata[0].label['@none'].length).toBe(1);
    expect(p3Manifest.metadata[0].label['@none'][0]).toBe("Description");
    expect(p3Manifest.metadata[0].hasOwnProperty('value')).toBe(true);
    expect(p3Manifest.metadata[0].value.constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].value.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.metadata[0].value['@none'].constructor).toEqual(Array);
    expect(p3Manifest.metadata[0].value['@none'].length).toBe(1);
    expect(p3Manifest.metadata[0].value['@none'][0]).toBe(p2Manifest['description']);
  });
  
  it('Test 6 Manifest: Multiple Descriptions', () => {
    const p2Manifest = manifestFixture(6);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));

    expect(p3Manifest.hasOwnProperty('metadata')).toBe(true);
    expect(p3Manifest.metadata.constructor).toEqual(Array);
    expect(p3Manifest.metadata.length).toBe(1);
    expect(p3Manifest.metadata[0].constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].hasOwnProperty('label')).toBe(true);
    expect(p3Manifest.metadata[0].label.constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].label.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.metadata[0].label['@none'].constructor).toEqual(Array);
    expect(p3Manifest.metadata[0].label['@none'].length).toBe(1);
    expect(p3Manifest.metadata[0].label['@none'][0]).toBe("Description");
    expect(p3Manifest.metadata[0].hasOwnProperty('value')).toBe(true);
    expect(p3Manifest.metadata[0].value.constructor).toEqual(Object);
    expect(p3Manifest.metadata[0].value.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.metadata[0].value['@none'].constructor).toEqual(Array);
    expect(p3Manifest.metadata[0].value['@none'].length).toBe(1);
    expect(p3Manifest.metadata[0].value['@none'][0]).toBe(p2Manifest['description'][0]);
    expect(p3Manifest.metadata[0].value.hasOwnProperty('en')).toBe(true);
    expect(p3Manifest.metadata[0].value['en'].constructor).toEqual(Array);
    expect(p3Manifest.metadata[0].value['en'].length).toBe(1);
    expect(p3Manifest.metadata[0].value['en'][0]).toBe(p2Manifest['description'][1]['@value']);
  });
  
  it('Test 7 Manifest: Rights Metadata', () => {
    const p2Manifest = manifestFixture(7);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2));
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('requiredStatement')).toBe(true);
    expect(p3Manifest.requiredStatement.constructor).toEqual(Object);
    expect(p3Manifest.requiredStatement.hasOwnProperty('label')).toBe(true);
    expect(p3Manifest.requiredStatement.label.constructor).toEqual(Object);
    expect(p3Manifest.requiredStatement.label.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.requiredStatement.label['@none'].constructor).toEqual(Array);
    expect(p3Manifest.requiredStatement.label['@none'].length).toBe(1);
    expect(p3Manifest.requiredStatement.label['@none'][0]).toBe("Attribution");
    expect(p3Manifest.requiredStatement.hasOwnProperty('value')).toBe(true);
    expect(p3Manifest.requiredStatement.value.constructor).toEqual(Object);
    expect(p3Manifest.requiredStatement.value.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.requiredStatement.value['@none'].constructor).toEqual(Array);
    expect(p3Manifest.requiredStatement.value['@none'].length).toBe(1);
    expect(p3Manifest.requiredStatement.value['@none'][0]).toBe(p2Manifest['attribution']);
    
  });
  
  it('Test 8 Manifest: SeeAlso link / Manifest', () => {
    const p2Manifest = manifestFixture(8);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('seeAlso')).toBe(true);
    expect(p3Manifest.seeAlso.constructor).toEqual(Array);
    expect(p3Manifest.seeAlso.length).toBe(1);
    expect(p3Manifest.seeAlso[0].constructor).toEqual(Object);
    expect(p3Manifest.seeAlso[0].hasOwnProperty('type')).toBe(true);
    expect(p3Manifest.seeAlso[0].type).toBe('Dataset');
    expect(p3Manifest.seeAlso[0].hasOwnProperty('id')).toBe(true);
    expect(p3Manifest.seeAlso[0].id).toEqual(p2Manifest.seeAlso);
  });
  
  it('Test 9 Manifest: Service link / Manifest', () => {
    const p2Manifest = manifestFixture(9);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('service')).toBe(true);
    expect(p3Manifest.service.constructor).toEqual(Array);
    expect(p3Manifest.service.length).toBe(1);
    expect(p3Manifest.service[0].constructor).toEqual(String);
    expect(p3Manifest.service[0]).toEqual(p2Manifest.service);
  });
  
  it('Test 10 Manifest: Service link as Object', () => {
    
    const p2Manifest = manifestFixture(10);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));

    expect(p3Manifest.hasOwnProperty('service')).toBe(true);
    expect(p3Manifest.service.constructor).toEqual(Array);
    expect(p3Manifest.service.length).toBe(1);
    expect(p3Manifest.service[0].constructor).toEqual(Object);
    // NOTE: is it service id or @id in v3?
    expect(JSON.stringify(p3Manifest.service[0])).toEqual(JSON.stringify(p2Manifest.service));
  });
  
  it('Test 11 Manifest: ViewingDirection: l-t-r', () => {
    const p2Manifest = manifestFixture(11);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('viewingDirection')).toBe(true);
    expect(p3Manifest.viewingDirection).toBe(p2Manifest.viewingDirection);
    expect(p3Manifest.viewingDirection).toEqual('left-to-right');
  });
  
  it('Test 12 Manifest: ViewingDirection: r-t-l', () => {
    const p2Manifest = manifestFixture(12);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('viewingDirection')).toBe(true);
    expect(p3Manifest.viewingDirection).toBe(p2Manifest.viewingDirection);
    expect(p3Manifest.viewingDirection).toEqual('right-to-left');
  });
  
  it('Test 13 Manifest: ViewingDirection: t-t-b', () => {
    const p2Manifest = manifestFixture(13);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('viewingDirection')).toBe(true);
    expect(p3Manifest.viewingDirection).toBe(p2Manifest.viewingDirection);
    expect(p3Manifest.viewingDirection).toEqual('top-to-bottom');
  });
  
  it('Test 14 Manifest: ViewingDirection: b-t-t', () => {
    const p2Manifest = manifestFixture(14);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('viewingDirection')).toBe(true);
    expect(p3Manifest.viewingDirection).toBe(p2Manifest.viewingDirection);
    expect(p3Manifest.viewingDirection).toEqual('bottom-to-top');
  });
  
  it('Test 15 Manifest: ViewingHint: paged', () => {
    const p2Manifest = manifestFixture(15);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('behavior')).toBe(true);
    expect(p3Manifest.behavior.constructor).toEqual(Array);
    expect(p3Manifest.behavior.includes('paged')).toBe(true);
    expect(p3Manifest.behavior.length).toBe(1);
  });
  
  it('Test 16 Manifest: ViewingHint: continuous', () => {
    const p2Manifest = manifestFixture(16);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('behavior')).toBe(true);
    expect(p3Manifest.behavior.constructor).toEqual(Array);
    expect(p3Manifest.behavior.includes('continuous')).toBe(true);
    expect(p3Manifest.behavior.length).toBe(1);
  });
  
  it('Test 17 Manifest: ViewingHint: individuals', () => {
    const p2Manifest = manifestFixture(17);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('behavior')).toBe(true);
    expect(p3Manifest.behavior.constructor).toEqual(Array);
    expect(p3Manifest.behavior.includes('individuals')).toBe(true);
    expect(p3Manifest.behavior.length).toBe(1);
  });
  
  it('Test 18 Manifest: Non Standard Keys', () => {
    const p2Manifest = manifestFixture(18);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('someProperty')).toBe(true);
    expect(p3Manifest.someProperty).toEqual(p2Manifest.someProperty);
  });
  
  it('Test 19 Manifest: Multiple Canvases', () => {
    const p2Manifest = manifestFixture(19);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('items')).toBe(true);
    expect(p3Manifest.items.constructor).toEqual(Array);
    expect(p3Manifest.items.length).toBe(2);
    expect(p3Manifest.items[0].hasOwnProperty('type')).toBe(true);
    expect(p3Manifest.items[0].type).toEqual("Canvas");
    expect(p3Manifest.items[1].hasOwnProperty('type')).toBe(true);
    expect(p3Manifest.items[1].type).toEqual("Canvas");
  });
  
  it('Test 20 Manifest: Multiple Sequences', () => {
    const p2Manifest = manifestFixture(20);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    //console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    expect(p3Manifest.hasOwnProperty('items')).toBe(true);
    expect(p3Manifest.items.constructor).toEqual(Array);
    expect(p3Manifest.items.length).toBe(1);
    expect(p3Manifest.items[0].constructor).toEqual(Object);
    expect(p3Manifest.items[0].hasOwnProperty('type')).toBe(true);
    expect(p3Manifest.items[0].type).toEqual("Canvas");
    expect(p3Manifest.hasOwnProperty('structures')).toBe(true);
    expect(p3Manifest.structures.constructor).toEqual(Array);
    expect(p3Manifest.structures.length).toBe(2);
    expect(p3Manifest.structures[0].constructor).toEqual(Object);
    expect(p3Manifest.structures[0].hasOwnProperty('type')).toBe(true);
    expect(p3Manifest.structures[0].type).toEqual("Range");
    expect(p3Manifest.structures[0].hasOwnProperty('behavior')).toBe(true);
    expect(p3Manifest.structures[0].behavior.constructor).toEqual(Array);
    expect(p3Manifest.structures[0].behavior.includes('sequence')).toBe(true);
    
    expect(p3Manifest.structures[0].hasOwnProperty('label')).toBe(true);
    expect(p3Manifest.structures[0].label.constructor).toEqual(Object);
    expect(p3Manifest.structures[0].label.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.structures[0].label['@none'].constructor).toEqual(Array);
    expect(p3Manifest.structures[0].label['@none'].length).toBe(1);
    expect(p3Manifest.structures[0].label['@none'][0]).toEqual(p2Manifest.sequences[0].label);
    expect(p3Manifest.structures[0].label['@none'][0]).toEqual("Test 20 Sequence 1");

    expect(p3Manifest.structures[1].constructor).toEqual(Object);
    expect(p3Manifest.structures[1].hasOwnProperty('type')).toBe(true);
    expect(p3Manifest.structures[1].type).toEqual("Range");
    expect(p3Manifest.structures[1].hasOwnProperty('behavior')).toBe(true);
    expect(p3Manifest.structures[1].behavior.constructor).toEqual(Array);
    expect(p3Manifest.structures[1].behavior.includes('sequence')).toBe(true);

    expect(p3Manifest.structures[1].hasOwnProperty('label')).toBe(true);
    expect(p3Manifest.structures[1].label.constructor).toEqual(Object);
    expect(p3Manifest.structures[1].label.hasOwnProperty('@none')).toBe(true);
    expect(p3Manifest.structures[1].label['@none'].constructor).toEqual(Array);
    expect(p3Manifest.structures[1].label['@none'].length).toBe(1);
    expect(p3Manifest.structures[1].label['@none'][0]).toEqual(p2Manifest.sequences[1].label);
    expect(p3Manifest.structures[1].label['@none'][0]).toEqual("Test 20 Sequence 2");
  });
  
  it('Test 21 Manifest: Sequence with Metadata', () => {
    const p2Manifest = manifestFixture(21);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // console.log(JSON.stringify(p3Manifest,null, 2))
    // test the context is correct
    expect(p3Manifest).toContainKey('@context');
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    
    // NOTE: sequence metadata is being lost if there's only one sequence...
  });
  
  it('Test 22 Manifest: /Sequence/ with non l-t-r viewingDirection', () => {
    const p2Manifest = manifestFixture(22);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 23 Manifest: /Sequence/ with non paged viewingHint', () => {
    const p2Manifest = manifestFixture(23);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 24 Manifest: Image with IIIF Service', () => {
    const p2Manifest = manifestFixture(24);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 25 Manifest: Image with IIIF Service, embedded info', () => {
    const p2Manifest = manifestFixture(25);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 26 Manifest: Image different size to Canvas', () => {
    const p2Manifest = manifestFixture(26);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 27 Manifest: No Image', () => {
    const p2Manifest = manifestFixture(27);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 28 Manifest: Choice of Image', () => {
    const p2Manifest = manifestFixture(28);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 29 Manifest: Choice of Image with IIIF Service', () => {
    const p2Manifest = manifestFixture(29);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 30 Manifest: Main + Detail Image', () => {
    const p2Manifest = manifestFixture(30);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 31 Manifest: Detail with IIIF Service', () => {
    const p2Manifest = manifestFixture(31);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 32 Manifest: Multiple Detail Images', () => {
    const p2Manifest = manifestFixture(32);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 33 Manifest: Detail Image with Choice', () => {
    const p2Manifest = manifestFixture(33);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 34 Manifest: Detail Image with Choice, and \'no image\' as option', () => {
    const p2Manifest = manifestFixture(34);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 35 Manifest: Partial Image as Main Image', () => {
    const p2Manifest = manifestFixture(35);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 36 Manifest: Partial Image as Main Image with IIIF Service', () => {
    const p2Manifest = manifestFixture(36);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 37 Manifest: Partial Image as Detail Image', () => {
    const p2Manifest = manifestFixture(37);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 38 Manifest: Partial Image as Detail Image with IIIF Service', () => {
    const p2Manifest = manifestFixture(38);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 39 Manifest: Image with CSS Rotation', () => {
    const p2Manifest = manifestFixture(39);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 40 Manifest: Multiple Languages for Metadata Labels', () => {
    const p2Manifest = manifestFixture(40);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 41 Manifest: Main Image with Server side Rotation', () => {
    const p2Manifest = manifestFixture(41);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 43 Manifest: Embedded Transcription on Canvas', () => {
    const p2Manifest = manifestFixture(43);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 44 Manifest: Embedded Transcription on Fragment Segment', () => {
    const p2Manifest = manifestFixture(44);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 45 Manifest: External text/plain Transcription on Canvas', () => {
    const p2Manifest = manifestFixture(45);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 46 Manifest: External text/plain Transcription on Segment', () => {
    const p2Manifest = manifestFixture(46);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 47 Manifest: Embedded HTML Transcription on Canvas', () => {
    const p2Manifest = manifestFixture(47);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 48 Manifest: Embedded HTML Transcription on Segment', () => {
    const p2Manifest = manifestFixture(48);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 51 Manifest: Embedded Comment on a Canvas', () => {
    const p2Manifest = manifestFixture(51);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 52 Manifest: Embedded Comment on a Segment', () => {
    const p2Manifest = manifestFixture(52);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 54 Manifest: Comment in HTML', () => {
    const p2Manifest = manifestFixture(54);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
  
  it('Test 61 Manifest: Embedded Transcription on Selector Segment', () => {
    const p2Manifest = manifestFixture(61);
    const p3Manifest = upgrader.processResource(
      clone(p2Manifest), 
      true
    );
    // test the context is correct
    expect(p3Manifest.hasOwnProperty('@context')).toBe(true);
    expect(JSON.stringify(p3Manifest['@context'])).toBe(JSON.stringify(P3_CONTEXT));
    // 

    //console.log(JSON.stringify(p3Manifest,null, 2))
  });
});
