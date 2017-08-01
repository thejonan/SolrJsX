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
  nestingField: null,         // The default nesting field.
  nestLevel: null,            // Inform which level needs to be nested into the listing.
  listingFields: [ "*" ],     // The fields that need to be present in the result list.
  
  /** Make the initial setup of the manager.
    */
  init: function (manager) {
    a$.pass(this, Solr.Listing, 'init', manager);
    
    if (this.nestLevel != null) {
      var level = this.nestingRules[this.nestLevel],
          chF = level.field || this.nestingField,
          parF = this.nestingRules[level.parent] && this.nestingRules[level.parent].field || this.nestingField;
      
      manager.addParameter('fl', 
        "[child parentFilter=" + parF + ":" + level.parent 
        + " childFilter=" + chF + ":" + this.nestLevel 
        + " limit=" + level.limit + "]");
    }

    a$.each(this.listingFields, function (f) { manager.addParameter('fl', f)});    
  }
  
};
