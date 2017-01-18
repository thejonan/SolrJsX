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
  this.faceters = { };

  this.id = settings.id;
  this.settings = settings;
  
  /* TODO:
    - Focus on nested facetting and proper statistics.
    - User Patterning in order to handle the actual filter building
    - 
    - Leave all ranging stuff for CurrentSearchWidget
    - PivotWidget should handle the actual DOM stuff via TagWidget.
    - 
  */
    
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
      this.faceters[f.id] = w = this.addFaceter(f, i);
      w.init(manager);
    }
  },
  
  addValue: function (value, id) {
    return this.faceters[id].addValue(value);
  },
  
  removeValue: function (value, id) {
    return this.faceters[id].removeValue(value);
  },
  
  hasValue: function (value, id) {
    if (!!id)
      return this.faceters[id].hasValue(value);
    else for (id in this.faceters)
      if (this.faceters[id].hasValue(value))
        return true;
    
    return false;
  }
};
