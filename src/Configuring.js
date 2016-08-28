(function (Solr, a$) {
  Solr.Configuring = function (obj) {
    a$.extend(true, this, obj);
    
    this.parameters = {};
  };

  /** This is directly copied from AjaxSolr.
    */  
  Solr.Configuring.escapeValue = function (value) {
    // If the field value has a space, colon, quotation mark or forward slash
    // in it, wrap it in quotes, unless it is a range query or it is already
    // wrapped in quotes.
    if (value.match(/[ :\/"]/) && !value.match(/[\[\{]\S+ TO \S+[\]\}]/) && !value.match(/^["\(].*["\)]$/)) {
      return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }
    return value;
  };
  
  var paramIsMultiple = function (name) { 
    return name.match(/^(?:bf|bq|facet\.date|facet\.date\.other|facet\.date\.include|facet\.field|facet\.pivot|facet\.range|facet\.range\.other|facet\.range\.include|facet\.query|fq|group\.field|group\.func|group\.query|pf|qf)$/);
  };
  
  Solr.Configuring.prototype = {
    /** Add a parameter. If `name` is an object - it is treated as a prepared
      * parameter and `value` and `locals` are ignored.
      */
    addParameter: function (param, value, locals) {
      var name;
      
      if (typeof param !== 'object') {
        name = param;
        param = { 'name': param, 'value': value, 'locals': locals };
      }
      else
        name = param.name;
      
      if (paramIsMultiple(name)) {
        if (this.parameters[name] === undefined)
          this.parameters[name = param;
        else {
          var found = false;
          a$.each(this.parameters[name], function (p) { found = found || a$.equal(true, param, p); });
          if (!found)
            this.parameters[name].push(param);
          else
            return false;
        }
      }
      else
        this.parameters[name] = param;
        
      return param;
    },
    
    findParameter: function (name, needle) {
      var indices = [];
      if (this.parameters[name] !== undefined) {
        if (paramIsMultiple(name)) {
          a$.each(this.parameters[name], function (p, i) {
            if (a$.match(p.value))
              indices.push(i);
          });
        }
        else if (a$.match(this.parameters[name].value, needle))
          indices.push(0);
      }
      return indices;
    },
    
    /** Remove parameters. If needle is an array it is treated as an idices array,
      * if not - it is first passed to findParameter() call.
      */
    removeParameters: function (name, indices) {
      if (this.parameters[name] !== undefined) {
        if (!Array.isArray(indices))
          indices = this.findParameter(indices);
        
        if (paramIsMultiple(name)) {
          if (indices.length < this.parameters[name].length) {
            for (var i = 0, il = indices.length; i < il; ++i)
              this.parameters.splice(indices[i], 1);
          }
          else
            delete this.parameters[name];  
        }
        else if (indices.length > 0) {
          delete this.parameters[name];
        }
          
        return indices.length;
      }
      else
        return false;
    },
    
    /** Returns a parameter or an array of parameters with that name
      */
    getParameter: function (name) {
      if (this.parameters[name] === undefined) {
        var param = { 'name': name };
        this.parameters[name] = paramIsMultiple(name) ? [ param ] : param;
      }
      return this.parameters[name];
    },
    
    /** Returns an array of values of all parameters with given name
      */
    getParametersValues: function (name) {
      var val = null;
      if (this.parameters[name] !== undefined)
        val = !paramIsMultiple(name) ? this.parameters[name].value : this.parameters[name].map(function (p) { return p.value; });

      return val;
    }
  };
  
})(Solr, asSys);
