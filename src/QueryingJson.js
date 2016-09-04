var renameParameter = function (name) {
  switch (name) {
    case 'fq': return 'filter';
    case 'q': return 'query';
    case 'fl': return 'fields';
    case 'rows': return 'limit';
    case 'start': return 'offset';
    case 'f': return 'facet';
    case 'ex': return 'excludeTags';
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
    
    // TODO. Manu things to be done!
    self.enumerateParameters(function (param) {
      var m;
      
      if (param.name === 'facet.field') {
        var fid = param.value;
        // TODO: extract the facet id from the domain obj
        a$.path(query, "facet." + fid + ".field", param.value);
        a$.path(query, "facet." + fid + ".type", "terms");
      }
      else if (!!(m = param.name.match(/^json\.(.+)/))) {
        a$.path(query, m[1], param.value);
      }
      else if (!!(m = param.name.match(/f\.(\w+)\.facet\.(\w+)/))) {
        a$.path(query, 'facet.' + m[1] + '.' + m[2], param.value);
      }
      else {
        a$.path(query, renameParameter(param.name), param.value);
      }
    });
    
    console.log("Query data: " + JSON.stringify(query));
    return { data: query };
  },
  
  parseQuery: function (response) {

  },
  
};
