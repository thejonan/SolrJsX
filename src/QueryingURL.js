(function (Solr, a$) {
  Solr.QueryingURL = function (obj) {
    a$.extend(true, this, obj);
  };
  
  Solr.QueryingURL.prototype = {
    prepareQuery: function () {
      // TODO: Prepare the URL string for the query
      return {
        url: ""
      };
    }
  };
  
})(Solr, a$);
