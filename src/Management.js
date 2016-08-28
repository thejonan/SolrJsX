(function (Solr, a$) {
  Solr.Management = function (obj) {
    a$.extend(true, this, obj);
    
    this.listeners = {};  // The set of listeners - based on their 'id'.
    this.response = null;
    this.error = null;

    this.currentRequest = null;
    this.pendingRequest = null;
  };
  
  Solr.Management.prototype = {
    /** Parameters that can and are expected to be overriden during initialization
      */
    connector: null,      // The object for making the actual requests - jQuery object works pretty fine.
    solrUrl: "",          // The bas Solr Url to be used, excluding the servlet.
    servlet: "select",    // Default servlet to be used is "select".
    
    onError: function (message) { window.console && console.log && console.log(message); },
    onPrepare: function (ajaxSettings) { return ajaxSettings; },
    onSuccess: null,
    ajaxSettings: {        // Default settings for the ajax call to the `connector`
      async: true,
      dataType: "json",
      error: this.onError,
      method: 'GET',
      processData: false,
    },
    
  
    /** The method for performing the actual request.
      */
    doRequest: function (servlet) {
      var self = this,
          cancel = null,
          settings = {};
      
      // Suppress same request before this one is finished processing. We'll
      // remember that we're being asked and will make _one_ request afterwards.
      if (self.currentRequest != null && self.currentRequest == servlet) {
        self.pendingRequest = servlet || self.servlet;
        return;
      }
      
      self.inRequest = true;
      // TODO: Inform all listeners that a query is going to happen - if any of them refuses - cancel it.
      for (var id in self.listeners) {
        var l = self.listeners[id];
        if (a$.act(l, l.beforeRequest) === false)
          cancel = l;
      }

      if (cancel !== null) {
        a$.act(cancel, self.onError, "Request cancelled");
        return; 
      }
      
      // This is expected to come from "Querying" skill.
      settings = a$.extend(settings, self.ajaxSettings, self.prepareQuery();
      settings.url = self.solrUrl + (servlet || self.servlet) + (settings.url || "");

      // TODO: Make the browser Back-functionality available.
      
      // Now prepare our success handler.
      settings.success = function (data) {
        self.response = data;
        for (var id in self.listeners) {
          var l = self.listeners[id];
          a$.act(l, l.afterRequest);
        }
        
        // Call this for Querying skills.
        self.parseResponse(self.response);
        
        // Time to call the passed on success handler.
        a$.act(self, self.onSuccess);
        
        // Now deal with pending requests, if such exists.
        // Pay attention that this is _not_ recursion, because
        // We're in the success handler, i.e. - async.
        self.currentRequest = null;
        if (self.pendingRequest)
          self.doRequest(self.pendingRequest);
      };
      
      // Give someone the opportunity to make final tweaks.
      a$.act(self, self.onPrepare, settings);
      
      // Inform all the skills for the preparation.
      a$.broadcast(self, 'onPrepare', settings);
      
      // And make the damn call.
      return self.connector.ajax( settings );
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
        
        // Inform the listener, that it has been added. 
        // Good time for initialization, with manager set.
        a$.act(l, l.onAdded, this);
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