(function (Solr, a$) {
  Solr.Management = function (obj) {
    a$.extend(true, this, obj);
    
    this.listeners = {};  // The set of listeners - based on their 'id'.
    this.response = null;
    this.error = null;
  };
  
  Solr.Management.prototype = {
    /** Parameters that can and are expected to be overriden during initialization
      */
    connector: null,      // The object for making the actual requests - jQuery object works pretty fine.
    solrUrl: "",          // The bas Solr Url to be used, excluding the servlet.
    servlet: "select",    // Default servlet to be used is "select".
    
    /** The method for performing the actual request.
      */
    doRequest: function (start, servlet) {
      var self = this,
          url = self.soldUrl + servlet,
          conf;
      
      // TODO: Inform all listeners that a query is going to happen - if any of them refuses - cancel it.

      // This is expected to come from "Querying" skill.
      conf = self.prepareQuery();
      
      // TODO: Make the Back-functionality available.
      
      // TODO: Prepare the request, based on the `conf` returned from the Querying skill.
      
      self.connector.ajax( url, {
        // TODO: Inform everybody for the result of the request.
        // TODO: Set the `self.response` and/or `self.error` properties to the result.
      } );
    },
 
    /** Add one or many listeners to the manager
      */   
    addListeners: function (listener) {
      if (!Array.isArray(listener))
        listener = [listener];
        
      for (var l, i = 0, ll = listener.length; i < ll; ++i) {
        l = listener[i];
        l.manager = this;
        this.listeners[l.id] = l;
      }
      
      return this;
    },
    
    /** Remove one listener
      */
    removeListener: function (listener) {
      delete this.listeners[listener.id];
      return this;
    },
    
    /** Remove many listeners, according to the given selector.
      * The selector(listener, manager) is invoked and on `true`
      * the listener is removed.
      */
    removeManyListeners: function (selector) {
      var self = this;
      a$.each(self.listeners(function (l, id) {
        if (selector(l, self))
          delete self.listeners[id];
      }));
      
      return self;
    }
   
  };
  
})(Solr, asSys);