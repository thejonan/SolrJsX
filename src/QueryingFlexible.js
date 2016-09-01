Solr.QueryingFlexible = function (obj) {
  a$.extend(true, this, obj);
};


Solr.QueryingFlexible.prototype = {
  __expects: [ Solr.Configuring, Solr.QueryingURL, Solr.QueryingJson ],
  jsonParameters: [ 'q' ],
  
  prepareQuery: function () {
    // TODO: Prepare the URL string for the query
    return {
      url: "",
      data: ""
    };
  },
  
  parseQuery: function (response) {

  }
};
