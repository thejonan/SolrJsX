(function (Solr, a$) {
  Solr.Searching = function (obj) {
    a$.extend(true, this, obj);
    this.manager = null;
    this.parameter = null;
  };
  
  Solr.Searching.prototype = {
    onFilter: null,         // Invoked everytime an actual filter change happens. 
                            // If null or `true` is returned - the request is initiated.
    
    /** Make the initial setup of the manager for this faceting skill (field, exclusion, etc.)
      */
    init: function () {
      
    },
    
    /** Make the actual filtering for the free-text searches. If `onFilter` returns true or
      * is not defined - initiates a request.
      */
    doFilter: function (value) {
      // TODO: Add/set parameter based on the field, multivalue, exclusion, etc.
    }
  };
  
})(Solr, a$);
