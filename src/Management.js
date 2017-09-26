/** SolrJsX library - a neXt Solr queries JavaScript library.
  * General query management - actual requests, listeners, etc.
  *
  * Author: Ivan Georgiev
  * Copyright © 2016, IDEAConsult Ltd. All rights reserved.
  */
  
Solr.Management = function (settings) {
  a$.extend(true, this, a$.common(settings, this));
  
  this.listeners = {};  // The set of listeners - based on their 'id'.
  this.response = null;
  this.error = null;

  this.pendingRequests = [];
  this.inRequest = false;
  
  // If username and password are given, a basic authentication is assumed
  // and proper headers added.
  if (!!settings && !!settings.solrUsername && !!settings.solrPassword) {
    var token = btoa(settings.solrUsername + ':' + settings.solrPassword);
    this.ajaxSettings.headers = { 'Authorization': "Basic " + token };
  }
};

Solr.Management.prototype = {
  __expects: [ "prepareQuery", "parseQuery" ],
  /** Parameters that can and are expected to be overriden during initialization
    */
  connector: null,      // The object for making the actual requests - jQuery object works pretty fine.
  solrUrl: "",          // The bas Solr Url to be used, excluding the servlet.
  servlet: "select",    // Default servlet to be used is "select".
  
  onPrepare: null,
  onError: null,
  onSuccess: null,
  ajaxSettings: {        // Default settings for the ajax call to the `connector`
    async: true,
    dataType: "json",
    method: 'GET',
    processData: false,
  },

  /** The method for performing the actual request. You can provide custom servlet to invoke
    * and/or custom `callback`, which, if present, will suppress the normal listener notification
    * and make an private call and `callback notification.
    */
  doRequest: function (servlet, callback) {
    var self = this,
        cancel = null,
        settings = {};
        
    // Suppress same request before this one is finished processing. We'll
    // remember that we're being asked and will make _one_ request afterwards.
    if (this.inRequest) {
      this.pendingRequests.push(arguments);
      return;
    }

    this.inRequest = true;
    
    // fix the incoming parameters
    if (typeof servlet === "function") {
      callback = servlet;
      servlet = self.servlet;
    }

    // Let the Querying skill build the settings.url / data
    settings = a$.extend(settings, self.ajaxSettings, self.prepareQuery());
    settings.servlet = servlet || self.servlet;
    settings.url = self.solrUrl + settings.servlet + (settings.url || "");

    // We don't make these calls on private requests    
    if (typeof callback !== "function") {
      // Now go to inform the listeners that a request is going to happen and
      // give them a change to cancel it.
      a$.each(self.listeners, function (l) {
        if (a$.act(l, l.beforeRequest, settings, self) === false)
          cancel = l;
      })
  
      if (cancel !== null) {
        a$.act(cancel, self.onError, null, "Request cancelled", cancel, self);
        return; 
      }
    }
        
    // Prepare the handlers for both error and success.
    settings.error = function (jqXHR, status, message) {
      a$.each(self.listeners, function (l) { a$.act(l, l.afterFailure, jqXHR, settings, self); });
      a$.act(self, self.onError, jqXHR, settings);
    };
    settings.success = function (data, status, jqXHR) {
      self.response = self.parseQuery(data);

      if (typeof callback === "function")
        callback(self.response);
      else {
        // Now inform all the listeners
        a$.each(self.listeners, function (l) { a$.act(l, l.afterRequest, self.response, settings, jqXHR, self); });
  
        // Call this for Querying skills, if it is defined.
        a$.act(self, self.parseResponse, self.response, servlet);  
      
        // Time to call the passed on success handler.
        a$.act(self, self.onSuccess, self.response, jqXHR, settings);
      }
    };
    
    settings.complete = function () {
      // Now deal with pending requests, if such exists.
      // Pay attention that this is _not_ recursion, because
      // We're in the success handler, i.e. - async.
      self.inRequest = false;
      if (self.pendingRequests.length > 0)
        self.doRequest.apply(self, self.pendingRequests.shift());
    };
    
    // Inform all our skills for the preparation.
    a$.broadcast(self, 'onPrepare', settings);
    
    // Call the custom provided preparation routines.
    a$.act(self, self.onPrepare, settings);
    
    // And make the damn call.
    return self.connector.ajax( settings );
  },

  /** Initialize the management and most importantly - the listener's
    */
  init: function () {
    var self = this;
    a$.pass(self, Solr.Management, "init");
    a$.each(this.listeners, function (l) {
      // Inform the listener that it has been added.
      a$.act(l, l.init, self);
    })  
  },
  
  /** Add one or many listeners to the manager
    */   
  addListeners: function (one) {
    var listener = one;
    if (arguments.length > 1)
      listener = arguments;
    else if (!Array.isArray(one))
      listener = [ one ];
    else
      listener = one;
      
    for (var l, i = 0, ll = listener.length; i < ll; ++i) {
      l = listener[i];
      this.listeners[l.id] = l;
    }
    
    return this;
  },
  
  /** Remove one listener. Can pass only the id.
    */
  removeListener: function (listener) {
    if (typeof listener === "objcet")
      listener = listener.id;
      
    delete this.listeners[listener];
    return this;
  },
  
  /** Remove many listeners, according to the given selector.
    * The selector(listener, manager) is invoked and on `true`
    * the listener is removed.
    */
  removeManyListeners: function (selector) {
    if (typeof selector !== 'function')
      throw { name: "Enumeration error", message: "Attempt to select-remove listeners with non-function 'selector': " + selector };
      
    var self = this;
    a$.each(self.listeners, function (l, id) {
      if (selector(l, id, self))
        delete self.listeners[id];
    });
    
    return self;
  },
  
  /** Enumerate all listeners.
    */
  enumerateListeners: function(callback, context) {
    if (typeof callback !== 'function')
      throw { name: "Enumeration error", message: "Attempt to enumerate listeners with non-function 'selector': " + callback };
      
    a$.each(this.listeners, function (l, id) {
      callback.call(l, l, id, context);
    });
  },
  
  /** A listener retrieval method
    */
  getListener: function (id) {
    return this.listeners[id];
  }
};
