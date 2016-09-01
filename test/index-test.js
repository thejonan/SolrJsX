var vows = require("vows"),
    assert = require("assert"),
    Solr = require("../"),
    suite = vows.describe("SolrJs2");

suite.addBatch({
  "SolrJs2:": {
    "Empty one": function () {
      
    }
  }
});

suite.export(module);
