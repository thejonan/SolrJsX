/** SolrJsX library - a neXt Solr queries JavaScript library.
  * Ranging skills - maintenance of appropriate parameters.
  *
  * Author: Ivan Georgiev
  * Copyright © 2017, IDEAConsult Ltd. All rights reserved.
  */
  
  
/**
  * Forms the string for filtering of the current facet value
  */
Solr.rangeValue = function (value) {
  return Array.isArray(value) ? "[" + Solr.escapeValue(value[0] || "*") + " TO " + Solr.escapeValue(value[1] || "*") + "]" : Solr.escapeValue(value);
};

/**
 * Parses a facet filter from a parameter.
 *
 * @returns {Object} { field: {String}, value: {Combined}, exclude: {Boolean} }.
 */ 
Solr.parseRange = function (value) {
  var m = value.match(/(-?)([^\s:]+):\s*\[\s*([^\s]+)\s+TO\s+([^\s]+)\s*\]/);
  return !!m ? { field: m[2], exclude: !!m[1], value: [ m[3], m[4] ] } : null
};


Solr.Ranging = function (settings) {
  this.field = this.id = null;
  
  a$.extend(true, this, a$.common(settings, this));
  this.manager = null;
  
  this.fqRegExp = new RegExp("^-?" + this.field + ":\\s*\\[\\s*[^\\s]+\\s+TO\\s+[^\\s]+\\s*\\]");
};

Solr.Ranging.prototype = {
  multirange: false,      // If this filter allows union of multiple ranges.  
  exclusion: false,       // Whether to exclude THIS field from filtering from itself.
  domain: null,           // Some local attributes to be added to each parameter.
  useJson: false,         // Whether to use the Json Facet API.
  domain: null,           // The default, per request local (domain) data.
  
  /** Make the initial setup of the manager.
    */
  init: function (manager) {
    a$.pass(this, Solr.Ranging, "init", manager);
    this.manager = manager;
    
    if (this.exclusion)
      this.domain = a$.extend(this.domain, { tag: this.id + "_tag" });

    this.fqName = this.useJson ? "json.filter" : "fq";
  },
  
  /**
   * Add a facet filter parameter to the Manager
   *
   * @returns {Boolean} Whether the filter was added.
   */    

  addValue: function (value, exclude) {
    // TODO: Handle the multirange case.
    this.clearValues();
    return this.manager.addParameter(this.fqName, this.fqValue(value, exclude), this.domain);
  },
  
  /**
   * Removes a value for filter query.
   *
   * @returns {Boolean} Whether a filter query was removed.
   */    
  removeValue: function (value) {
    // TODO: Handle the multirange case.
    return this.clearValues();
  },
  
  /**
   * Tells whether given value is part of facet filter.
   *
   * @returns {Boolean} If the given value can be found
   */      
  hasValue: function (value) {
    // TODO: Handle the multirange case.
    return this.manager.findParameters(this.fqName, this.fqRegExp) != null;
  },
  
  /**
   * Removes all filter queries using the widget's facet field.
   *
   * @returns {Boolean} Whether a filter query was removed.
   */
  clearValues: function () {
    return this.manager.removeParameters(this.fqName, this.fqRegExp);
  },
  
   /**
   * @param {String} value The facet value.
   * @param {Boolean} exclude Whether to exclude this fq parameter value.
   * @returns {String} An fq parameter value.
   */
  fqValue: function (value, exclude) {
    return (exclude ? '-' : '') + this.field + ':' + Solr.rangeValue(value);
  }
};
