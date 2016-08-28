(function (Solr, a$) {
  Solr.Configuring = function (obj) {
    a$.extend(true, this, obj);
    
    this.parameters = [];
  };
  
  Solr.Configuring.prototype = {
    /** Add a parameter. If `name` is an object - it is treated as a prepared
      * parameter and `value` and `locals` are ignored.
      */
    addParameter: function (param, value, locals) {
      if (typeof param !== 'object')
        param = { 'name': param, 'value': value, 'locals': locals };
        
      // TODO: Add/overwrite the parameter.
      // TODO: ?? Add __index property?
      
      return param;
    },
    
    findParameter: function (needle) {
      var indices = [];
      return indices;
    },
    
    /** Remove parameters. If needle is an array it is treated as an idices array,
      * if not - it is first passed to findParameter() call.
      */
    removeParameters: function (indices) {
      if (!Array.isArray(indices))
        indices = this.findParameter(indices);
        
      for (var i = 0, il = indices.length; i < il; ++i)
        this.parameters.splice(indices[i], 1);
        
      return indices;
    },
    

  };
  
})(Solr, asSys);
