(function (Solr, a$) {
  Solr.QueryingJson = function (obj) {
    a$.extend(true, this, obj);
  };
  
  Solr.QueryingJson.prototype = {
    prepareQuery: function () {
      // TODO: Prepare the Json object for the request body
      return {
        body: {
          
        }
      };
    }
  };
  
})(Solr, a$);
