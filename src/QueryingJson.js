var renameParameter = function (name) {
  switch (name) {
    case 'fq': return 'filter';
    case 'q': return 'query';
    case 'fl': return 'fields';
    case 'rows': return 'limit';
    case 'start': return 'offset';
    case 'f': return 'facet';
    default: return name.replace(/^json\./, "");
  }
};

Solr.QueryingJson = function (obj) {
  a$.extend(true, this, obj);
};

Solr.QueryingJson.prototype = {
  __expects: [ Solr.Configuring ],
  prepareQuery: function () {
    var self = this,
        query = {};
    a$.each(self.parameterStore, function (param, name) {
      name = renameParameter(name).split(".");
      
      for (var i = 0, nl = name.length, q = query, n; i < nl - 1; ++i) {
        n = name[i];
        
        if (i == 0 && n == 'f')
          n = 'facet';
        else if (i >= 2 && name == 'facet')
          continue;
          
        if (q[n] === undefined)
          q[n] = {};
        q = q[n];
      }
      
      q[name[i]] = param.value;
    });
    
    console.log("Query data: " + JSON.stringify(query));
    return { data: query };
  },
  
  parseQuery: function (response) {

  },
  
};
