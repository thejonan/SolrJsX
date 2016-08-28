(function (Solr, a$) {
  Solr.QueryingJson = function (obj) {
    a$.extend(true, this, obj);
  };
  
  Solr.QueryingJson.prototype = {
    __expects: [ Solr.Configuring ],
    prepareQuery: function () {
      // TODO: Prepare the Json object for the request body
      return {
        data: {
          
        }
      };
    },
    
    parseQuery: function (response) {

    }
  };
  
})(Solr, a$);
