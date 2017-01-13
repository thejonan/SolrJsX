/** SolrJsX library - a neXt Solr queries JavaScript library.
  * Delayed request skills.
  *
  * Author: Ivan Georgiev
  * Copyright © 2017, IDEAConsult Ltd. All rights reserved.
  */
  
Solr.Delaying = function (settings) {
  this.delayTimer = null;
  this.delayed = settings && settings.delayed || this.delayed;
};

Solr.Delaying.prototype = {
  delayed: false,       // Number of milliseconds to delay the request
  
  /** Make the actual request obeying the "delayed" settings.
    */
  doRequest: function () {
    var self = this,
        doInvoke = function () {
          a$.pass(this, Solr.Delaying, "doRequest");
          self.delayTimer = null;
        };
    if (this.delayed == null || this.delayed < 10)
      return doInvoke();
    else if (this.delayTimer != null)
      clearTimeout(this.delayTimer);
      
    this.delayTimer = setTimeout(doInvoke, this.delayed);
  }
  
};
