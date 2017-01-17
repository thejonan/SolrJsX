/** SolrJsX library - a neXt Solr queries JavaScript library.
  * Pivoting, i.e. nested faceting skils.
  *
  * Author: Ivan Georgiev
  * Copyright © 2017, IDEAConsult Ltd. All rights reserved.
  */

Solr.Pivoting = function (settings) {
  a$.extend(true, this, a$.common(settings, this));
  this.manager = null;
  this.facetWidgets = [];
};

Solr.Pivoting.prototype = {
  pivot: null,              // If document nesting is present - here are the rules for it.
  useJson: false,           // Whether to prepare everything with Json-based parameters.
  
  /** Make the initial setup of the manager.
    */
  init: function (manager) {
    a$.pass(this, Solr.Pivoting, 'init', manager);
    
    this.manager = manager;

    var loc = { stats: this.id + "_stats" };
    if (this.exclusion)
      loc.ex = this.id + "_tag";

    this.manager.addParameter('facet.pivot', this.pivotFields.join(","), loc);
    this.manager.addParameter('stats', true);
    this.manager.addParameter('stats.field', this.statField, { tag: this.id + "_stats", min: true, max: true });
    
    this.topField = this.pivotFields[0];
    
    var self = this;
    a$.each(this.facetFields, function (f, k) {
      manager.addListeners(f.widget = new (a$(Solr.Faceting))({
        id: k,
        field: k,
        multivalue: self.multivalue,
        aggregate: self.aggregate,
        exclusion: self.exclusion,
        color: f.color
      }));
      
      f.widget.init(manager);
    });
    
    
  }
  
};
