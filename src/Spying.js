/** SolrJsX library - a neXt Solr queries JavaScript library.
  * Spying, i.e. alternative requesting skill.
  *
  * Author: Ivan Georgiev
  * Copyright © 2017, IDEAConsult Ltd. All rights reserved.
  */
    
Solr.Spying = function (settings) {
  a$.extend(true, this, a$.common(settings, this));
  this.manager = null;
};

Solr.Spying.prototype = {
  servlet: null,        // The custom servlet to use for the request
  
  /** Make the initial setup of the manager.
    */
  init: function (manager) {
    a$.pass(this, Solr.Spying, "init", manager);
    this.manager = manager;
  },
  
  /** Make the actual request.
    */
  doSpying: function (settings, callback) {
    var man = this.manager;

    man.pushParameters(true);
    if (typeof settings === "function")
      settings(man);
    else a$.each(settings, function (v, k) {
      if (v == null)
        man.removeParameters(k);
      else if (Array.isArray(v))
        a$.each(v, function (vv) { man.addParameter(k, vv); });
      else if (typeof v === "object")
        man.addParameter(v);
      else
        man.addParameter(k, v);
    });
    
    man.doRequest(this.servlet, callback || this.onSpyResponse);
    man.popParameters();
  }
    
};
