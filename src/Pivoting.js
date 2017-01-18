/** SolrJsX library - a neXt Solr queries JavaScript library.
  * Pivoting, i.e. nested faceting skils.
  *
  * Author: Ivan Georgiev
  * Copyright © 2017, IDEAConsult Ltd. All rights reserved.
  */

var DefaultFaceter = a$(Solr.Faceting);

Solr.Pivoting = function (settings) {
  a$.extend(true, this, a$.common(settings, this));
  this.manager = null;
  this.faceters = [ ];

  this.id = settings.id;
  this.settings = settings;
};

Solr.Pivoting.prototype = {
  pivot: null,          // If document nesting is present - here are the rules for it.
  useJson: false,       // Whether to prepare everything with Json-based parameters.
  statistics: null,     // The per-facet statistics that are needed.
  
  /** Creates a new faceter for the corresponding level
    */
  addFaceter: function (facet, idx) {
    return new DefaultFaceter(facet);
  },
  
  /** Make the initial setup of the manager.
    */
  init: function (manager) {
    a$.pass(this, Solr.Pivoting, 'init', manager);
    
    this.manager = manager;

    var stats = this.statistics;
    if (!this.useJson) {
      // TODO: Test this!
      var loc = { };
      if (!!stats) {
        loc.stats = this.id + "_stats";
        Solr.facetStats(this.manager, loc.stats, stats);
        
        // We clear this to avoid later every faceter from using it.
        stats = null;
      }
        
      if (this.exclusion)
        loc.ex = this.id + "_tag";
        
      this.manager.addParameter('facet.pivot', this.pivot.map(function(f) { return (typeof f === "string") ? f : f.field; }).join(","), loc);
    }
    
    var location = "json";
    for (var i = 0, pl = this.pivot.length; i < pl; ++i) {
      var p = this.pivot[i],
          f = a$.extend(true, { }, this.settings, typeof p === "string" ? { id: p, field: p, disabled: true } : p),
          w;
      
      location += ".facet." + f.id;
      if (this.useJson)
        f.jsonLocation = location;
      
      // We usually don't need nesting on the inner levels.
      if (p.nesting == null && i > 0)
        delete f.nesting;
        
      f.statistics = stats;
      this.faceters.push(w = this.addFaceter(f, i));
      w.init(manager);
    }
  },
  
  getPivotCounts: function (pivot_counts) {
    if (pivot_counts == null)
      pivot_counts = this.manager.response.facet_counts;
      
    if (this.useJson === true)
      return pivot_counts.count > 0 ? pivot_counts[this.faceters[0].id].buckets : [];
    else
      throw { error: "Not supported for now!" }; // TODO!!!
  },
  
  addValue: function (id, value, exclude) {
    return this.faceters.find(function (f) { return f.id === id; }).addValue(value, exclude);
  },
  
  removeValue: function (id, value) {
    return this.faceters.find(function (f) { return f.id === id; }).removeValue(value);
  },
  
  clearValues: function () {
    a$.each(this.faceters, function (f) { f.clearValues(); });
  },
  
  hasValue: function (id, value) {
    for (var i = 0, fl = this.faceters.length; i < fl; ++i) {
      var f = this.faceters[i];
      if (id != null && f.id !== id)
        continue;
      if (f.hasValue(value))
        return true;
    }
    
    return false;
  },
  
   /**
   * @param {String} value The stringified facet value
   * @returns {Object|String} The value that produced this output
   */
  fqParse: function (value) {
    for (var i = 0, fl = this.faceters.length; i < fl; ++i) {
      var f = this.faceters[i],
          p = f.fqParse(value);
          
      if (p != null)
        return { id: f.id, value: p };
    }
    
    return null;
  }
  
};
