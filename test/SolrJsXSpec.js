asSys = require("as-sys");
_ = require("underscore");
Solr = require("../");

a$ = asSys;

describe("SolrJsX:", function () {
	// Now - GO with the tests.
	describe("Configuration:", function () {
  	
  	it("Adds/Gets raw parameter", function () {
  	  var main = new (a$(Solr.Configuring))();
    	main.addParameter("rows", 20);
    	expect(main.getParameter("rows").value).toBe(20);
  	});
  	
  	it("Adds/Gets single-parameter", function () {
  	  var main = new (a$(Solr.Configuring))();
    	main.addParameter("q", "field1:value1");
    	main.addParameter("q", "field2:value2");
    	expect(main.getParameter("q")).toEqual({ name: "q", value: "field2:value2" });
  	});

  	it("Adds/Gets multi-parameter", function () {
  	  var main = new (a$(Solr.Configuring))();
    	main.addParameter("fq", "field1:value1");
    	main.addParameter("fq", "field2:value2");
    	expect(main.getParameter("fq")).toEqual([ { name: "fq", value:"field1:value1" }, { name: "fq", value: "field2:value2" }]);
  	});

  	it("Removes multi-parameter", function () {
  	  var main = new (a$(Solr.Configuring))();
    	main.addParameter("fq", "field1:value1");
    	main.addParameter("fq", "field2:value2");
    	main.removeParameters("fq", 0);
    	expect(main.getParameter("fq", 0)).toEqual({ name: "fq", value:"field2:value2" });
  	});
  	
  	it("Resets the parameters store", function () {
  	  var main = new (a$(Solr.Configuring))();
    	main.addParameter("fq", "field1:value1");
    	main.resetParameters();
    	expect(main.parameterStore).toEqual({});
  	});
	});
	
	describe("Making URL-based queries", function () {
  	var main = new (a$(Solr.Configuring, Solr.QueryingURL))();
  	
  	it("Forms the URL on simple parameters", function () {
    	main.resetParameters();
    	main.addParameter("q", "f:v");
    	main.addParameter("rows", 20);
    	expect(main.prepareQuery()).toEqual({ url: "?q=f%3Av&rows=20" });
  	});

  	it("Forms the URL on multi parameters", function () {
    	main.resetParameters();
    	main.addParameter("q", "*:*");
    	main.addParameter("fq", "field1:value1");
    	main.addParameter("fq", "field2:value2");
    	main.addParameter("json.nl", "map");  	
    	expect(main.prepareQuery()).toEqual({ url: "?q=*%3A*&fq=field1%3Avalue1&fq=field2%3Avalue2&json.nl=map" });
  	});
  	
  	// TODO: Add some escapeValue involving tests
  	
	});
	
	describe("Json-based querying", function () {
  	var main = new (a$(Solr.Configuring, Solr.QueryingJson))();
  	
  	it ("Prepares the query settings", function () {
    	main.resetParameters();
    	main.addParameter("q", "f:v");
    	main.addParameter("rows", 20);
    	expect(main.prepareQuery()).toEqual({ url: "?q=f%3Av", contentType: "application/json", method: "POST", type: "POST", data: '{"params":{"rows":20}}' });
  	});
  	
  	it ("Handles simple parameters", function () {
    	main.resetParameters();
    	main.addParameter("q", "f:v");
    	main.addParameter("fq", "field1:value1");
    	main.addParameter("rows", 20);
    	main.addParameter("json.nl", "map");
    	
    	var q = main.prepareQuery();
    	
    	expect(q.url).toBe("?q=f%3Av&json.nl=map");
    	expect(JSON.parse(q.data)).toEqual({ 
      	params: { rows: 20, fq: [ "field1:value1" ] }
      });
  	});

  	it ("Adds Json-based parameter", function () {
    	main.resetParameters();
    	main.addParameter("q", "f:v");
    	main.addParameter("rows", 20);
    	main.addParameter("json.facet", { avg_price: "avg(price)" });
    	
    	var q = main.prepareQuery();
    	expect(q.url).toBe("?q=f%3Av");
    	expect(JSON.parse(q.data)).toEqual({ 
      	params: { rows: 20 },
      	facet: { avg_price: "avg(price)" }
      });
    });
      
  	it ("Adds multiple Json-based parameter", function () {
    	main.resetParameters();
    	main.addParameter("q", "f:v");
    	main.addParameter("rows", 20);
    	main.addParameter("json.query", "field3:value3");
    	main.addParameter("json.query", "field4:value4");
    	
    	var q = main.prepareQuery();
    	expect(q.url).toBe("?q=f%3Av");
    	expect(JSON.parse(q.data)).toEqual({ 
      	params: { rows: 20 },
      	query: [ "field3:value3", "field4:value4" ]
      });
  	});
  	
	}) // Json querying
	
	describe("Flat (URL) faceting", function () {
    var facet = new (a$(Solr.Faceting))({ id: "test", field: "field" });
	}); // Json faceting
	
	describe("Json API faceting", function () {
    
  	describe("Simple faceting", function () {
      var main = new (a$(Solr.Management, Solr.Configuring, Solr.QueryingJson))();
      var facet = new (a$(Solr.Faceting))({ id: "test", field: "field", useJson: true });
      main.resetParameters();
      main.addListeners(facet);
      main.init();
      
      it("Has built proper json configuration", function () {
        var data = JSON.parse(main.prepareQuery().data);
        expect(data.facet).toEqual({ "test": { field: "field", type: "terms", mincount: 1, limit: -1 } });
      });
      
      // TODO: Add add/remove/has tests.
    });
    
    describe("Faceting with exclusion", function () {
      var main = new (a$(Solr.Management, Solr.Configuring, Solr.QueryingJson))();
      var facet = new (a$(Solr.Faceting))({ id: "test", field: "field", useJson: true, exclusion: true });
      main.resetParameters();
      main.addListeners(facet);
      main.init();
      
      it("Has built proper json configuration", function () {
        var data = JSON.parse(main.prepareQuery().data);
        expect(data.facet).toEqual({ "test": { field: "field", type: "terms", mincount: 1, limit: -1, domain: { excludeTags: "test_tag" } } });
      });

      // TODO: Add add/remove/has tests.
      
    });
	}); // Json faceting

	
});
