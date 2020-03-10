/** SolrJsX library - a neXt Solr queries JavaScript library.
  * Added ability to give pattern to text/facet/range values.
  *
  * Author: Ivan Georgiev
  * Copyright © 2017, IDEAConsult Ltd. All rights reserved.
  */
    
Solr.Patterning = function (settings) {
  this.valuePattern = settings && settings.valuePattern || this.valuePattern;
  var oldRE = this.fqRegExp.toString().replace(/^\/\^?|\$?\/$/g,""),
      newRE = "^" + 
        this.escapeRegExp(this.valuePattern.replace(/\{\{!?-\}\}/g, "-?").replace("{{v}}", "__v__"))
          .replace("__v__", oldRE)
          .replace("--?", "-?")
          .replace("--", "");
      
  this.fqRegExp = new RegExp(newRE);
};

Solr.Patterning.prototype = {
  valuePattern: "{{-}}{{v}}",   // The default pattern.
  
  escapeRegExp: function(str) {
	  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },
  fqValue: function(value,
     exclude) {
    return this.valuePattern
      .replace("{{-}}", exclude ? "-" : "")   // place the exclusion...
      .replace("{{!-}}", exclude ? "" : "-")  // ... or negative exclusion.
      .replace("{{v}}", a$.pass(this, Solr.Patterning, "fqValue", value, exclude)) // now put the actual value
      .replace("--", ""); // and make sure there is not double-negative. TODO!
  }
  
};
