/** SolrJsX library - a neXt Solr queries JavaScript library.
  * Simple indoor requesting skills.
  *
  * Author: Ivan Georgiev
  * Copyright © 2017, IDEAConsult Ltd. All rights reserved.
  */
    
Solr.Requesting = function (settings) {
  this.manager = null;
  if (!!settings) {
    this.customResponse = settings.customResponse;
    this.resetPage = !!settings.resetPage;
  }
};

Solr.Requesting.prototype = {
  resetPage: true,      // Whether to reset to the first page on each requst.
  customResponse: null, // A custom response function, which if present invokes priavte doRequest.
  
  /** Make the initial setup of the manager for this faceting skill (field, exclusion, etc.)
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
  }
    
};
