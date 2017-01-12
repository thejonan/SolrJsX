/** SolrJsX library - a neXt Solr queries JavaScript library.
  * Free text search skills.
  *
  * Author: Ivan Georgiev
  * Copyright © 2016, IDEAConsult Ltd. All rights reserved.
  */
  
(function (Solr, a$){
  
Solr.Texting = function (settings) {
  this.manager = null;
  this.delayTimer = null;
  
  if (settings != null) {
    this.delayed = settings.delayed || this.delayed;
    this.domain = settings.domain || this.domain;
    this.customResponse = settings.customResponse;
  }
};

Solr.Texting.prototype = {
  delayed: false,       // Number of milliseconds to delay the request
  domain: null,         // Additional attributes to be adde to query parameter.
  customResponse: null, // A custom response function, which if present invokes priavte doRequest.
  
  /** Make the initial setup of the manager for this faceting skill (field, exclusion, etc.)
    */
  init: function (manager) {
    this.manager = manager;
  },
  
  /** Make the actual filtering obeying the "delayed" settings.
    */
  doRequest: function () {
    var self = this,
        doInvoke = function () {
          self.manager.addParameter('start', 0);
          self.manager.doRequest(self.customResponse);
          self.delayTimer = null;
        };
    if (this.delayed == null || this.delayed < 10)
      return doInvoke();
    else if (this.delayTimer != null)
      clearTimeout(this.delayTimer);
      
    this.delayTimer = setTimeout(doInvoke, this.delayed);
  },
  
  /**
   * Sets the main Solr query to the given string.
   *
   * @param {String} q The new Solr query.
   * @returns {Boolean} Whether the selection changed.
   */
  set: function (q) {
    var before = this.manager.getParameter('q'),
        res = this.manager.addParameter('q', q, this.domain);
        after = this.manager.getParameter('q');
    return res && !a$.equal(before, after);
  },

  /**
   * Sets the main Solr query to the empty string.
   *
   * @returns {Boolean} Whether the selection changed.
   */
  clear: function () {
    return this.manager.removeParameters('q');
  },

  /**
   * Returns a function to unset the main Solr query.
   *
   * @returns {Function}
   */
  unclickHandler: function () {
    var self = this;
    return function () {
      if (self.clear())
        self.doRequest();

      return false;
    }
  },

  /**
   * Returns a function to set the main Solr query.
   *
   * @param {String} value The new Solr query.
   * @returns {Function}
   */
  clickHandler: function (q) {
    var self = this;
    return function () {
      if (self.set(q))
        self.doRequest();

      return false;
    }
  }
  
};

})(Solr, asSys);
