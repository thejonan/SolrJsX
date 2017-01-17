/** SolrJsX library - a neXt Solr queries JavaScript library.
  * Simple indoor requesting skills.
  *
  * Author: Ivan Georgiev
  * Copyright © 2017, IDEAConsult Ltd. All rights reserved.
  */
    
Solr.Requesting = function (settings) {
  a$.extend(true, this, a$.common(settings, this));
  this.manager = null;
};

Solr.Requesting.prototype = {
  resetPage: true,      // Whether to reset to the first page on each requst.
  customResponse: null, // A custom response function, which if present invokes priavte doRequest.
  
  /** Make the initial setup of the manager.
    */
  init: function (manager) {
    a$.pass(this, Solr.Requesting, "init", manager);
    this.manager = manager;
  },
  
  /** Make the actual request.
    */
  doRequest: function () {
    if (this.resetPage)
      this.manager.addParameter('start', 0);
    this.manager.doRequest(self.customResponse);
  },
  
  /**
   * @param {String} value The value.
   * @returns {Function} Sends a request to Solr if it successfully adds a
   *   filter query with the given value.
   */
  clickHandler: function (value) {
    var self = this;
    return function (e) {
      if (self.addValue(value))
        self.doRequest();
        
      return false;
    };
  },

  /**
   * @param {String} value The value.
   * @returns {Function} Sends a request to Solr if it successfully removes a
   *   filter query with the given value.
   */
  unclickHandler: function (value) {
    var self = this;
    return function (e) {
      if (self.removeValue(value)) 
        self.doRequest();
        
      return false;
    };
  }
    
};
