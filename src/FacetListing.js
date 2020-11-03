/** SolrJsX library - a neXt Solr queries JavaScript library.
  * Facet extraction - used for autocomplete with combination of Texting, etc.
  *
  * Author: Ivan Georgiev
  * Copyright © 2020, IDEAConsult Ltd. All rights reserved.
  */

var defaultParameters = {
  'facet': true,
  'rows': 0,
  'fl': "id",
  'facet.limit': -1,
  'facet.mincount': 1,
  'echoParams': "none"
};
  
Solr.FacetListing = function (settings) {
  a$.extend(true, this, a$.common(settings, this));
  this.id = settings.id;
  
  this.parameters = a$.extend(true, { }, defaultParameters);
  this.facetPath = this.useJson ? "facets" : "facet_counts.facet_fields";
  if (!this.useJson)
    this.parameters['json.nl'] = "map";    
};

Solr.FacetListing.prototype = {
  __expects: [ "addValue", "doSpying", "resetValue", "onFound" ],

  servlet: "select",          // what phrase to use on the internal queries
  urlFeed: null,              // which URL parameter to use for initial setup
  useJson: false,             // Whether to use JSON-style parameter setup
  maxResults: 30,             // maximum results in the Autocomplete box
  activeFacets: null,         // a map of active / inactive facets. Default is ON.
  
  init: function (manager) {
    a$.pass(this, Solr.FacetListing, "init", manager);
    this.manager = manager;
    
    // make the initial values stuff
    if (this.urlFeed) {
      var needle = $.url().param(this.urlFeed);
      this.addValue(needle);
      this.resetValue(needle);
    }
  },

  onSelect: function (item) {
    var added = (typeof item === 'string') ? this.addValue(item) : this.manager.getListener(item.id).addValue(item.value);
    
    if (added)
      this.manager.doRequest();
    
    return added;
  },
  
  doRequest: function (term) {
    var self = this;
    
    this.doSpying(
      function (manager) {
        manager.removeParameters('fl');
        manager.mergeParameters(self.parameters);
  
        // manager and self.manager should be the same.
        self.addValue(term || "");
      },
      function (response) { 
        self.onResponse(response);
      });
  },
  
  onResponse: function (response) {
    var self = this,
        list = [];
        
    _.each(_.get(response, this.facetPath), function (facet, fid) {
      if (list.length >= self.maxResults ||
          typeof facet !== "object" || 
          self.activeFacets && self.activeFacets[fid] === false)
        return;
        
      _.each(self.useJson ? facet.buckets : facet, function (entry, key) {
        if (list.length >= self.maxResults)
          return;
          
        if (!self.useJson)
          entry = { 'val': key, 'count': entry };

        list.push({
          id: fid,
          value: entry.val,
          label: (self.lookupMap[entry.val] || entry.val) + ' (' + entry.count + ') - ' + fid
        });
      });
    });

    this.onFound(list);
  },
    
  afterRequest: function () {
    var qval = this.manager.getParameter('q').value || "";
    this.resetValue(qval != "*:*" && qval.length > 0 ? qval : "");
  }
};
