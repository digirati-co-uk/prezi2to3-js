const Upgrader = require('../src/index');

describe('prezi2to3', () => {

    describe('fixType', () => {
        let fixTypeUpgrader = null;
        beforeEach(() => {
            fixTypeUpgrader = new Upgrader({
                "ext_ok": false, 
                "deref_links": false
            });
        });
        
        it('convets oa:CssStyle to CssStylesheet', () => {
            let result = fixTypeUpgrader.fixType({
                "@type": ['oa:CssStyle']
            });
            expect(result).not.toHaveProperty('@type');
            expect(result).toHaveProperty('type');
            expect(result.type).toEqual('CssStylesheet');
        });

        it('convets cnt:ContentAsText to TextualBody', () => {
            let result = fixTypeUpgrader.fixType({
                "@type": ['cnt:ContentAsText']
            });
            expect(result).not.toHaveProperty('@type');
            expect(result).toHaveProperty('type');
            expect(result.type).toEqual('TextualBody');  
        });

        it('converts sc:Canvas to Canvas', () => {
            let canvasTypeResult = fixTypeUpgrader.fixType({
                "@type": 'sc:Canvas'
            });
            expect(canvasTypeResult).not.toHaveProperty('@type');
            expect(canvasTypeResult).toHaveProperty('type');
            expect(canvasTypeResult.type).toEqual('Canvas');  
        });

        it('converts sc:Manifest to Manifest', () => {
            let manifestTypeResult = fixTypeUpgrader.fixType({
                "@type": 'sc:Manifest'
            });

            expect(manifestTypeResult).not.toHaveProperty('@type');
            expect(manifestTypeResult).toHaveProperty('type');
            expect(manifestTypeResult.type).toEqual('Manifest');
        });

        it('converts sc:Sequence to Range', () => {
            let sequenceTypeResult = fixTypeUpgrader.fixType({
                "@type": 'sc:Sequence'
            });

            expect(sequenceTypeResult).not.toHaveProperty('@type');
            expect(sequenceTypeResult).toHaveProperty('type');
            expect(sequenceTypeResult.type).toEqual('Sequence'); 
        });

        it('converts sc:AnnotationList to AnnotationPage', () => {
            let sequenceTypeResult = fixTypeUpgrader.fixType({
                "@type": 'sc:AnnotationList'
            });

            expect(sequenceTypeResult).not.toHaveProperty('@type');
            expect(sequenceTypeResult).toHaveProperty('type');
            expect(sequenceTypeResult.type).toEqual('AnnotationPage'); 
        });

        it('converts sc:Collection to Collection', () => {
            let collectionTypeResult = fixTypeUpgrader.fixType({
                "@type": 'sc:Collection'
            });

            expect(collectionTypeResult).not.toHaveProperty('@type');
            expect(collectionTypeResult).toHaveProperty('type');
            expect(collectionTypeResult.type).toEqual('Collection');
        });

        it('converts oa:Annotation to Annotation', () => {
            let annotationTypeResult = fixTypeUpgrader.fixType({
                "@type": 'oa:Annotation'
            });

            expect(annotationTypeResult).not.toHaveProperty('@type');
            expect(annotationTypeResult).toHaveProperty('type');
            expect(annotationTypeResult.type).toEqual('Annotation');
        });

        it('converts sc:Layer to AnnotationCollection', () => {
            let annotationPageTypeResult = fixTypeUpgrader.fixType({
                "@type": 'sc:Layer'
            });

            expect(annotationPageTypeResult).not.toHaveProperty('@type');
            expect(annotationPageTypeResult).toHaveProperty('type');
            expect(annotationPageTypeResult.type).toEqual('AnnotationCollection');
        });

        it('converts oa:SpecificResource to SpecificResource', () => {

            let specificResourceTypeResult = fixTypeUpgrader.fixType({
                "@type": 'oa:SpecificResource'
            });

            expect(specificResourceTypeResult).not.toHaveProperty('@type');
            expect(specificResourceTypeResult).toHaveProperty('type');
            expect(specificResourceTypeResult.type).toEqual('SpecificResource');
        });

        it('converts oa:FrangmentSelector to FragmentSelector', () => {
            let fragmentSelectorTypeResult = fixTypeUpgrader.fixType({
                "@type": 'oa:FrangmentSelector'
            });

            expect(fragmentSelectorTypeResult).not.toHaveProperty('@type');
            expect(fragmentSelectorTypeResult).toHaveProperty('type');
            expect(fragmentSelectorTypeResult.type).toEqual('FrangmentSelector');
        });

        it('converts oa:Choice to Choice', () => {
            let choiceTypeResult = fixTypeUpgrader.fixType({
                "@type": 'oa:Choice'
            });

            expect(choiceTypeResult).not.toHaveProperty('@type');
            expect(choiceTypeResult).toHaveProperty('type');
            expect(choiceTypeResult.type).toEqual('Choice');
        });

        it('converts dctypes:Image to Image', () => {
            let imageTypeResult = fixTypeUpgrader.fixType({
                "@type": 'dctypes:Image'
            }); //TODO: still image

            expect(imageTypeResult).not.toHaveProperty('@type');
            expect(imageTypeResult).toHaveProperty('type');
            expect(imageTypeResult.type).toEqual('Image');
        });

        it('converts iiif:ImageApiSelector to ImageApiSelector', () => {
            let imageApiSelectorTypeResult = fixTypeUpgrader.fixType({
                "@type": 'iiif:ImageApiSelector'
            });

            expect(imageApiSelectorTypeResult).not.toHaveProperty('@type');
            expect(imageApiSelectorTypeResult).toHaveProperty('type');
            expect(imageApiSelectorTypeResult.type).toEqual('ImageApiSelector');
        });
        it('converts cnt:ContentAsText to TextualBody', () => {
            let texualBodyTypeResult = fixTypeUpgrader.fixType({
                "@type": 'cnt:ContentAsText'
            });

            expect(texualBodyTypeResult).not.toHaveProperty('@type');
            expect(texualBodyTypeResult).toHaveProperty('type');
            expect(texualBodyTypeResult.type).toEqual('TextualBody');
        });
    });

    describe('Service', () => {
        let serviceUpgrader = null;
        beforeEach(() => {
            serviceUpgrader = new Upgrader({
                "ext_ok": false, 
                "deref_links": false
            });
        });
        
        it('converts the new @id to id and @type to type', () => {
            let serviceResult = serviceUpgrader.processService({
                '@id': 'serviceId',
                '@type': 'Service'
            });
            expect(serviceResult).not.toHaveProperty('@id');
            expect(serviceResult).not.toHaveProperty('@type');

            expect(serviceResult).toHaveProperty('id');
            expect(serviceResult).toHaveProperty('type');
        });

        // Ask Stephen or Tom.
        // it('generates id an id if no @id or id present in the original service', () => {
        //     let serviceResult = serviceUpgrader.processService({
        //         '@type': 'Service'
        //     });
        //     expect(serviceResult).toHavePropertys(['id'])
        // });

        it('converts the service inside the servie to an array if it was an object', () => {
            let serviceResult = serviceUpgrader.processService({
                '@id': "some service Id",
                '@type': 'Service',
                'service' : {
                    '@id': "some other service id",
                    '@type': 'Service2'
                }
            });
            expect(serviceResult).toHaveProperty('service');
            expect(serviceResult.service.constructor).toEqual(Array);
            expect(serviceResult.service.length).toBe(1);
            expect(serviceResult.service[0].constructor).toEqual(Object);
            expect(serviceResult.service[0].type).toEqual("Service");
        })
    });

    describe('Collection', () => {
        
        let collectionUpgrader = null;
        beforeEach(() => {
            collectionUpgrader = new Upgrader({
                "ext_ok": false, 
                "deref_links": false
            });
        });
        it('converts collection members to items', () => {
            let v3Collection = collectionUpgrader.processCollection({
                members: []
            });
            expect(v3Collection).not.toHaveProperty('members');
            expect(v3Collection).toHaveProperty('items');
        });

        it('converts sub-collections to items', () => {
            let v3Collection = collectionUpgrader.processCollection({
                collections: [{
                    '@type': 'sc:Collection'
                }]
            });
            expect(v3Collection).not.toHaveProperty('collections');
            expect(v3Collection).toHaveProperty('items');
        });

        it('converts collection ids to collection objects', () => {
            let sampleCollectionId = "http://iiif.io/api/presentation/2.1/example/fixtures/collection.json"
            let v3Collection = collectionUpgrader.processCollection({
                collections: [sampleCollectionId]
            });
            expect(v3Collection).not.toHaveProperty('collections');
            expect(v3Collection).toHaveProperty('items');
            expect(v3Collection.items.constructor).toEqual(Array);
            expect(v3Collection.items.length).toBe(1);
            expect(v3Collection.items[0].constructor).toBe(Object);
            expect(v3Collection.items[0]).toHaveProperty('id');
            expect(v3Collection.items[0].id).toEqual(sampleCollectionId);
        });
    
        it('converts manifests to items', () => {
            let v3Collection = collectionUpgrader.processCollection({
                manifests: [{
                    '@type': 'sc:Manifest'
                }]
            });
            expect(v3Collection).not.toHaveProperty('manifests');
            expect(v3Collection).toHaveProperty('items');
        });
        it('converts manifest ids to manifests objects', () => {
            let sampleManifestId = "http://iiif.io/api/presentation/2.1/example/fixtures/1/manifest.json"
            let v3Collection = collectionUpgrader.processCollection({
                manifests: [sampleManifestId]
            });
            expect(v3Collection).not.toHaveProperty('manifests');
            expect(v3Collection).toHaveProperty('items');
            expect(v3Collection.items.constructor).toEqual(Array);
            expect(v3Collection.items.length).toBe(1);
            expect(v3Collection.items[0].constructor).toBe(Object);
            expect(v3Collection.items[0]).toHaveProperty('id');
            expect(v3Collection.items[0].id).toEqual(sampleManifestId);
        });
    });

    describe('Manifest', () => {
        
        let manifestUpgrader = new Upgrader({
            "ext_ok": false,
            "deref_links": false
        });

        it('creates an object for the start canvas if it is just an id', () => {
            let manifestResult = manifestUpgrader.processManifest({
                startCanvas: "canvasId"
            })
            expect(manifestResult).toHaveProperty('start');
            expect(manifestResult).not.toHaveProperty('startCanvas');
            expect(manifestResult.start.constructor).toEqual(Object);
            expect(manifestResult.start).toHaveProperty('id')
            expect(manifestResult.start).toHaveProperty('type')
            expect(manifestResult.start.id).toEqual("canvasId");
            expect(manifestResult.start.type).toEqual("Canvas");
        });

        // TODO: investigate that at this stage without the post 
        // should it contain the final 'id' property
        it('updates the startCanvas type to Canvas instead of sc:Canvas', () => {
            let manifestResult = manifestUpgrader.processManifest({
                startCanvas: {
                    "@id": "canvasId",
                    '@type': "sc:Canvas"
                }
            })
            expect(manifestResult).toHaveProperty('start');
            expect(manifestResult).not.toHaveProperty('startCanvas');
            expect(manifestResult.start.constructor).toEqual(Object);
            expect(manifestResult.start).toHaveProperty('type')
            //expect(manifestResult.start.id).toEqual("canvasId");
            expect(manifestResult.start.type).toEqual("Canvas");
        });

        it('converts sequences to ranges', () => {
            let manifestResult = manifestUpgrader.processManifest({
                sequences: [{
                    "@id": 'sequenceId',
                    viewingDirection: 'right-to-left'  
                },{
                    canvases: [],
                    viewingHint: 'individual'
                }]
            });
            expect(manifestResult).toHaveProperty('_structures');
            expect(manifestResult._structures.constructor).toEqual(Array);
            expect(manifestResult._structures.length).toBe(2);
            expect(manifestResult._structures[0].constructor).toEqual(Object);
            expect(manifestResult._structures[0]).toHaveProperty('type');
            expect(manifestResult._structures[0].type).toEqual('Range');
            expect(manifestResult._structures[1].constructor).toEqual(Object);
            expect(manifestResult._structures[1]).toHaveProperty('type');
            expect(manifestResult._structures[1].type).toEqual('Range');
            expect(manifestResult._structures[0]).toHaveProperty('id');
            expect(manifestResult._structures[0].id).toEqual('sequenceId');
            expect(manifestResult._structures[1]).toHaveProperty('id');
            expect(manifestResult._structures[0]).toHaveProperty('behavior');
            expect(manifestResult._structures[1]).toHaveProperty('behavior');
            expect(manifestResult._structures[1]).not.toHaveProperty('canvases');
        });
    });

    describe('Range', () => {
        let rangeUpgrader = null;
        beforeEach(() => {
            rangeUpgrader = new Upgrader({
                "ext_ok": false, 
                "deref_links": false
            });
        });

        it('passes through sequences converted to range', () => {
            let rangeResult = rangeUpgrader.processRange({
                items:[]
            });
            expect(rangeResult).toHaveProperty('items');
        });

        it('converts members to items', () => {
            let rangeResult = rangeUpgrader.processRange({
                members:[{
                    '@id': 'someCanvasId',
                    '@type': 'Canvas'
                }]
            });
            expect(rangeResult).toHaveProperty('items');
            expect(rangeResult).not.toHaveProperty('members');
        });

        it('converts canvases to items', () => {
            let rangeResult = rangeUpgrader.processRange({
                canvases:[{
                    '@id': 'someCanvasId',
                    '@type': 'Canvas'
                }]
            });
            expect(rangeResult).toHaveProperty('items');
            expect(rangeResult).not.toHaveProperty('canvases');
        });

        it('converts sub-ranges to items', () => {
            let rangeResult = rangeUpgrader.processRange({
                ranges:[{
                    '@id': 'someRangeId',
                    items:[]
                }]
            });
            expect(rangeResult).toHaveProperty('items');
            expect(rangeResult).not.toHaveProperty('ranges');
            
            expect(rangeResult.items.constructor).toEqual(Array);
            expect(rangeResult.items[0]).toHaveProperty('items');
        });

        it('converts contentLayer to AnnotationCollections', () => {
            let rangeResult = rangeUpgrader.processRange({
                contentLayer: "http://example.org/iiif/book1/layer/introTexts"
            });
            expect(rangeResult).toHaveProperty('supplementary');
            expect(rangeResult.supplementary.constructor).toEqual(Object);
            expect(rangeResult.supplementary).toHaveProperty('type');
            expect(rangeResult.supplementary.type).toEqual('AnnotationCollection');
        });

        it('removes redundant top ranges form the behaviors', () => {
            let rangeResult = rangeUpgrader.processRange({
                behavior: ['top', 'paged']
            });
            expect(rangeResult).toHaveProperty('behavior');
            expect(rangeResult.behavior.constructor).toEqual(Array);
            expect(rangeResult.behavior).not.toContain('top');
        });
    });

    describe('Canvas', () => {       
        let canvasUpgrader = null;
        beforeEach(() => {
            canvasUpgrader = new Upgrader({
                "ext_ok": false, 
                "deref_links": false
            });
        });
        it('converts images to AnnotationPage.items', ()=> {
            let canvasResult = canvasUpgrader.processCanvas({
                images: [{
                    '@id': 'imageId',
                    '@type': 'sc:Image'
                }]
            });
            expect(canvasResult).toHaveProperty('items');
            expect(canvasResult).not.toHaveProperty('images');
            expect(canvasResult.items.constructor).toEqual(Array);
            expect(canvasResult.items.length).toBe(1);
            expect(canvasResult.items[0].constructor).toEqual(Object);
            expect(canvasResult.items[0]).toHaveProperty('type');
            expect(canvasResult.items[0]).toHaveProperty('items');
            expect(canvasResult.items[0].type).toEqual('AnnotationPage');
            expect(canvasResult.items[0].items.constructor).toEqual(Array);
            expect(canvasResult.items[0].items.length).toBe(1);
            expect(canvasResult.items[0].items[0]).toHaveProperty('@id');
            expect(canvasResult.items[0].items[0]).toHaveProperty('@type');
            expect(canvasResult.items[0].items[0]['@type']).toEqual('sc:Image');
        });
    });

    // describe('Layer', () => {
    // it is really just processing generic at the moment
    // });

    describe('AnnotationPage', () => {
        
        let annotationPageUpgrader = null;
        beforeEach(() => {
            annotationPageUpgrader = new Upgrader({
                "ext_ok": false, 
                "deref_links": false
            });
        });
        
        it('converts resources to items', ()=> {
            let annotationPageResult = annotationPageUpgrader.processAnnotationpage({
                resources: [{
                    '@id': 'imageId',
                    '@type': 'sc:Image'
                }]
            });
            expect(annotationPageResult).toHaveProperty('items');
            expect(annotationPageResult.items.constructor).toEqual(Array);
            expect(annotationPageResult).not.toHaveProperty('resources');
        });

        it('creates empty items if the source does not contain resources or items', ()=> {
            let annotationPageResult = annotationPageUpgrader.processAnnotationpage({
            });
            expect(annotationPageResult).toHaveProperty('items');
            expect(annotationPageResult.items.constructor).toEqual(Array);
        });
    });
    // describe('AnnotationCollection', () => {
       // it is really just processing generic at the moment
    // });
 
    describe('Annotation', () => {
        let annotationUpgrader = null;
        beforeEach(() => {
            annotationUpgrader = new Upgrader({
                "ext_ok": false, 
                "deref_links": false
            });
        });
        
        it('converts on property to target ', ()=> {
            let annotationPageResult = annotationUpgrader.processAnnotation({
                on: "someCanvasId"
            });
            expect(annotationPageResult).toHaveProperty('target');
        });

        it('converts resource property to body', ()=> {
            let annotationPageResult = annotationUpgrader.processAnnotation({
                resource: {
                    id: 'resourcemock'
                }
            });
            expect(annotationPageResult).toHaveProperty('body');
        });

        it('replaces motivation namespaces', ()=> {
            let annotationPageResult = annotationUpgrader.processAnnotation({
                motivation: 'sc:painting'
            });
            expect(annotationPageResult).toHaveProperty('motivation');
            expect(annotationPageResult.motivation).toEqual('painting');
            let annotationPageResult2 = annotationUpgrader.processAnnotation({
                motivation: 'oa:commenting'
            });
            expect(annotationPageResult2).toHaveProperty('motivation');
            expect(annotationPageResult2.motivation).toEqual('commenting');
        });

        it('converts inline stylesheets', ()=> {
            let annotationPageResult = annotationUpgrader.processAnnotation({
                stylesheet: {
                    chars: 'test{color:red;}'
                }
            });
            expect(annotationPageResult).toHaveProperty('stylesheet');
            expect(annotationPageResult.stylesheet).toHaveProperty('value');
            expect(annotationPageResult.stylesheet).not.toHaveProperty('chars');
        });

        it('converts stylesheet links', ()=> {
            let annotationPageResult = annotationUpgrader.processAnnotation({
                stylesheet: 'this is a link'
            });
            expect(annotationPageResult).toHaveProperty('stylesheet');
            expect(annotationPageResult.stylesheet).toHaveProperty('@id');
            expect(annotationPageResult.stylesheet).toHaveProperty('@type');
            expect(annotationPageResult.stylesheet).not.toHaveProperty('value');
            expect(annotationPageResult.stylesheet).not.toHaveProperty('chars');
        }); 
    });
    
    describe('SpecificResource', () => {
        let specificResourceUpgrader = null;
        beforeEach(() => {
            specificResourceUpgrader = new Upgrader({
                "ext_ok": false, 
                "deref_links": false
            });
        });
        
        it('converts full property to source ', ()=> {
            let specificResourcePageResult = specificResourceUpgrader.processSpecificresource({
                full: "mockfull"
            });
            expect(specificResourcePageResult).toHaveProperty('source');
            expect(specificResourcePageResult.source).toEqual('mockfull');
        });

        it('converts style property to styleClass ', ()=> {
            let specificResourcePageResult = specificResourceUpgrader.processSpecificresource({
                style: "mockstyleclass"
            });
            expect(specificResourcePageResult).toHaveProperty('styleClass');
            expect(specificResourcePageResult.styleClass).toEqual('mockstyleclass');
        });
    });

    describe('TextualBody', () => {
        let textualBodyUpgrader = null;
        beforeEach(() => {
            textualBodyUpgrader = new Upgrader({
                "ext_ok": false, 
                "deref_links": false
            });
        });
        
        it('covenrts chars property to values', ()=> {
            let textualBodyPageResult = textualBodyUpgrader.processTextualbody({
                chars: "test text"
            });
            expect(textualBodyPageResult).toHaveProperty('value');
            expect(textualBodyPageResult).not.toHaveProperty('chars');
            expect(textualBodyPageResult.value).toEqual('test text');
        });
    });

    describe('Choice', () => {
        let choiceUpgrader = null;
        beforeEach(() => {
            choiceUpgrader = new Upgrader({
                "ext_ok": false, 
                "deref_links": false
            });
        });
        it('appends the default property to yhe items', () =>{
            let choiceResult = choiceUpgrader.processChoice({
                default: { id: "defaultId" }
            });
            expect(choiceResult).toHaveProperty('items');
            expect(choiceResult).not.toHaveProperty('default');
            expect(choiceResult.items.constructor).toEqual(Array);
            expect(choiceResult.items.length).toBe(1);
            expect(choiceResult.items[0].id).toEqual('defaultId');
        });

        it('converts item property to items', () =>{
            let choiceResult = choiceUpgrader.processChoice({
                item: [{ 
                    id: "itemId1" 
                },{ 
                    id: "itemId2" 
                }]
            });
            expect(choiceResult).toHaveProperty('items');
            expect(choiceResult).not.toHaveProperty('item');
            expect(choiceResult.items.constructor).toEqual(Array);
            expect(choiceResult.items.length).toBe(2);
            expect(choiceResult.items[0].id).toEqual('itemId1');
            expect(choiceResult.items[1].id).toEqual('itemId2');
        });

        it('converts item was not an Array items will be an array', () =>{
            let choiceResult = choiceUpgrader.processChoice({
                item: { id: "itemId" }
            });
            expect(choiceResult).toHaveProperty('items');
            expect(choiceResult).not.toHaveProperty('item');
            expect(choiceResult.items.constructor).toEqual(Array);
            expect(choiceResult.items.length).toBe(1);
            expect(choiceResult.items[0].id).toEqual('itemId');
        });
    });

    describe('wans', () => {
        let upgrader = null;
        beforeEach(() => {
            upgrader = new Upgrader({
                "ext_ok": false, 
                "deref_links": false,
            });
        });
        it('wans if its debug', ()=>{
            upgrader.debug=true;
            upgrader.warn("test");
            upgrader.debug=false;
        })
    })
    describe('retrieveResource', () => {
        let upgrader = null;
        beforeEach(() => {
            upgrader = new Upgrader({
                "ext_ok": false, 
                "deref_links": false,
            });
        });
        it('returns empty object if it fails, response status is not 200', ()=>{
            let nonExistingURI = "http://example.com/testmanifest/manifst.json";
            let result = upgrader.retrieveResource(nonExistingURI);
            expect(result.constructor).toEqual(Object);
            expect(Object.keys(result).length).toBe(0);
        });
        it('returns empty object if it fails decode the json', ()=>{
            let nonExistingURI = "http://example.com/";
            let result = upgrader.retrieveResource(nonExistingURI);
            expect(result.constructor).toEqual(Object);
            expect(Object.keys(result).length).toBe(0);
        });
    })  
    describe('setRemoteType', () => {
        let upgrader = null;
        beforeEach(() => {
            upgrader = new Upgrader({
                "ext_ok": false, 
                "deref_links": false,
            });
            //monkey patch other functions 
            upgrader.getHeader = (uri) => ({
                headers: {
                    get: (headerName) => (upgrader.getHeader[headerName])
                },
                status: 200
            });
            upgrader.retrieveResource= (uri) => {
                return upgrader.retrieveResource.data;
            }
        });
        it('gets type form header. content type', () => {
            upgrader.getHeader['content-type'] = 'text/plain';
            let what =  { id: 'test' };
            upgrader.setRemoteType(what);
            expect(what.type).toEqual('Text');
        });

        it('gets type form header. content type first part ', () => {
            upgrader.getHeader['content-type'] = 'image/jpeg';
            let what =  { id: 'test' };
            upgrader.setRemoteType(what);
            expect(what.type).toEqual('Image');
        });

        it('gets type form data because it was json, p2 linked resource ', () => {
            upgrader.getHeader['content-type'] = 'application/json';
            upgrader.retrieveResource.data = { '@type': 'sc:Manifest'}
            let what =  { id: 'test' };
            upgrader.setRemoteType(what);
            expect(what.type).toEqual('Manifest');
        });
        it('gets type form data because the header was json, p3 linked resource ', () => {
            upgrader.getHeader['content-type'] = 'application/json';
            upgrader.retrieveResource.data = { 'type': 'Manifest'}
            let what =  { id: 'test' };
            upgrader.setRemoteType(what);
            expect(what.type).toEqual('Manifest');
        });
        it('gets type form data because the header was json-ld, p3 linked resource ', () => {
            upgrader.getHeader['content-type'] = 'application/ld+json';
            upgrader.retrieveResource.data = { 'type': 'Manifest'}
            let what =  { id: 'test' };
            upgrader.setRemoteType(what);
            expect(what.type).toEqual('Manifest');
        });
    })
    describe('getHeader', () => {
        let upgrader = null;
        beforeEach(() => {
            upgrader = new Upgrader({
                "ext_ok": false, 
                "deref_links": false,
            });
        });
        it('returns a simplified object if the response status was 200', () => {
            let uri = "http://iiif.io/api/presentation/2.1/example/fixtures/1/manifest.json";
            let getHEaderResult = upgrader.getHeader(uri);
            expect(getHEaderResult.constructor).toEqual(Object);
            expect(getHEaderResult).toHaveProperty('status');
            expect(getHEaderResult).toHaveProperty('headers');
        });
        it('returns a simplified object if the response status was other than 200', () => {
            let uri = "http://example.com/smething/not/exist";
            let getHEaderResult = upgrader.getHeader(uri);
            expect(getHEaderResult).toBe(null)
        });
    })
});
