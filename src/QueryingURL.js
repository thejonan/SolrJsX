/** SolrJsX library - a neXt Solr queries JavaScript library.
  * URL querying skills - stacking up all parameters for URL-baesd query.
  *
  * Author: Ivan Georgiev
  * Copyright © 2016, IDEAConsult Ltd. All rights reserved.
  */
  
Solr.stringifyDomain = function (param) {
  var prefix = [];

  a$.each(param.domain, function (l, k) {  prefix.push((k !== 'type' ? k + '=' : '') + l); });
  return prefix.length > 0 ? "{!" + prefix.join(" ") + "}" : "";
};

Solr.stringifyValue = function (param) {
  var value = param.value || "";
    
  if (Array.isArray(value))
    return value.join(",");
  else if (typeof value !== 'object')
    return value.toString(); 
  else {
    var str = [];
    a$.each(value, function (v, k) { str.push(Solr.escapeField(k) + ":" + Solr.escapeValue(v)); });
    return str.join(" ");
  }
};

Solr.stringifyParameter = function (param) { 
    var prefix = Solr.stringifyDomain(param);
    
    // For dismax request handlers, if the q parameter has local params, the
    // q parameter must be set to a non-empty value.
    return param.value || prefix ? param.name + "=" + encodeURIComponent(prefix + Solr.stringifyValue(param)) : null;
}

Solr.QueryingURL = function (settings) {
};

Solr.QueryingURL.prototype = {
  __expects: [ "enumerateParameters" ],
  
  prepareQuery: function () {
    var query = [],
        self = this;
        
    this.enumerateParameters(function (param) {
      var p = Solr.stringifyParameter(param);
      if (p != null)
        query.push(p);
    });
    
    return { url: '?' + query.join("&") };
  },
  
  parseResponse: function (response) {
    return response;
  }
  
};
