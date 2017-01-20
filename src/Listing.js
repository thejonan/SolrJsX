/** SolrJsX library - a neXt Solr queries JavaScript library.
  * Result list tunning and preparation.
  *
  * Author: Ivan Georgiev
  * Copyright © 2017, IDEAConsult Ltd. All rights reserved.
  */
  
Solr.Listing = function (settings) {
  a$.extend(true, this, a$.common(settings, this));
  this.manager = null;
};

Solr.Listing.prototype = {
  nestingRules: null,         // If document nesting is present - here are the rules for it.
  listingFields: [ "*" ],     // The fields that need to be present in the result list.
  
  /** Make the initial setup of the manager.
    */
  init: function (manager) {
    a$.pass(this, Solr.Listing, 'init', manager);
    
    a$.each(this.nestingRules, function (r, i) {
      manager.addParameter('fl', 
        "[child parentFilter=" + r.field + ":" + r.parent 
        + " childFilter=" + r.field + ":" + i 
        + " limit=" + r.limit + "]");
    });

    a$.each(this.listingFields, function (f) { manager.addParameter('fl', f)});    
  }
  
};
