(function (Solr, a$) {
  Solr.QueryingURL = function (obj) {
    a$.extend(true, this, obj);
  };

  var paramValue = function (value) {
    if (Array.isArray(value))
      return value.join(",");
    else if (typeof value !== 'object')
      return value.toString(); 
    else {
      var str = [];
      a$.each(value, function (v, k) { str.push(k + ":" + Solr.quoteValue(v)); });
      return str.join(" ");
    }
  }
  
  Solr.QueryingURL.prototype = {
    __expects: [ Solr.Configuring ],
    
    prepareQuery: function () {
      var self = this,
          query = [];
          
      a$.each(self.parameterStore, function (plist, name) {
        if (!Array.isArray(plist)) plist = [plist];
        a$.each(plist, function (param) {
          var prefix = [];
              
          a$.each(param.locals, function (l, k) { prefix.push(k + (l != null ? "=" + l : "")); })
          prefix = prefix.length > 0 ? "{!" + prefix.join(" ") + "}" : "";
          
          if (param.value)
            query.push(name + "=" + encodeURIComponent(prefix + paramValue(param.value)));

          // For dismax request handlers, if the q parameter has local params, the
          // q parameter must be set to a non-empty value. In case the q parameter
          // has local params but is empty, use the q.alt parameter, which accepts
          // wildcards.
          else if (name == 'q' && prefix) {
            query.push('q.alt=' + encodeURIComponent(prefix + '*:*'));
          }
        });
      });
      
      return { url: '?' + query.join("&") };
    },
    
    parseQuery: function (response) {

    },
    
    parseValue: function (value) {
      
    }
  };
  
})(Solr, a$);
