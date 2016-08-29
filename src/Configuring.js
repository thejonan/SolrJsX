/**
  * Parameter specification: https://cwiki.apache.org/confluence/display/solr/Local+Parameters+in+Queries
  */
(function (Solr, a$) {
  /** This is directly copied from AjaxSolr.
    */  
  Solr.quoteValue = function (value) {
    // If the field value has a space, colon, quotation mark or forward slash
    // in it, wrap it in quotes, unless it is a range query or it is already
    // wrapped in quotes.
    if (value.match(/[ :\/"]/) && !value.match(/[\[\{]\S+ TO \S+[\]\}]/) && !value.match(/^["\(].*["\)]$/)) {
      return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }
    return value;
  };
  
  Solr.parseParameter = function (str) {
    var param = { },
        parse = str.match(/^([^=]+)=(?:\{!([^\}]*)\})?(.*)$/);
    if (parse) {

      if (parse[2] != null) {
        var matches;
        while (matches = /([^\s=]+)=?(\S*)?/g.exec(parse[2])) {
          if (param.locals === undefined)
            param.locals = {};
          if (matches[2] == null)
            param.locals['type'] = matches[1];
          else
            param.locals[matches[1]] = matches[2];
          parse[2] = parse[2].replace(matches[0], ''); // Safari's exec seems not to do this on its own
        }
      }

      if (parse[1] == 'q.alt') {
        // if q.alt is present, assume it is because q was empty, as above
        param.name = 'q';
      }
      else {
        param.name = parse[1];
        var arr = parse[3].split(",");
        param.value = arr.length > 1 ? arr : parse[3];
      }
    }
    
    return param;
  };
  
  Solr.Configuring = function (obj) {
    a$.extend(true, this, obj);
    
    // Now make some reformating of initial parameters.
    var self = this;
        
    this.parameterStore = {};
    a$.each(this.parameters, function (p, name) {
      if (typeof p === 'string')
        self.addParameter(Solr.parseParameter(name + '=' + p));
      else
        self.addParameter(name, p);
    });
    // We no longer need this - free them.
    delete obj.parameters;
    delete this.parameters;
  };

  var paramIsMultiple = function (name) { 
    return name.match(/^(?:bf|bq|facet\.date|facet\.date\.other|facet\.date\.include|facet\.field|facet\.pivot|facet\.range|facet\.range\.other|facet\.range\.include|facet\.query|fq|group\.field|group\.func|group\.query|pf|qf|stats\.field)$/);
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
        if (this.parameterStore[name] === undefined)
          this.parameterStore[name] = param;
        else {
          var found = false;
          a$.each(this.parameterStore[name], function (p) { found = found || a$.equal(true, param, p); });
          if (!found)
            this.parameterStore[name].push(param);
          else
            return false;
        }
      }
      else
        this.parameterStore[name] = param;
        
      return param;
    },
    
    /** Find all parameters matching the needle - it can be RegExp, string, etc.
      * Always returns an array of indices - it could be empty, but is an array.
      */
    findParameter: function (name, needle) {
      var indices = [];
      if (this.parameterStore[name] !== undefined) {
        if (paramIsMultiple(name)) {
          a$.each(this.parameterStore[name], function (p, i) {
            if (a$.match(p.value))
              indices.push(i);
          });
        }
        else if (a$.match(this.parameterStore[name].value, needle))
          indices.push(0);
      }
      return indices;
    },
    
    /** Remove parameters. If needle is an array it is treated as an idices array,
      * if not - it is first passed to findParameter() call.
      */
    removeParameters: function (name, indices) {
      if (this.parameterStore[name] !== undefined) {
        if (!Array.isArray(indices))
          indices = this.findParameter(indices);
        
        if (paramIsMultiple(name)) {
          if (indices.length < this.parameterStore[name].length) {
            for (var i = 0, il = indices.length; i < il; ++i)
              this.parameterStore.splice(indices[i], 1);
          }
          else
            delete this.parameterStore[name];  
        }
        else if (indices.length > 0) {
          delete this.parameterStore[name];
        }
          
        return indices.length;
      }
      else
        return false;
    },
    
    /** Returns a parameter or an array of parameters with that name
      */
    getParameter: function (name) {
      if (this.parameterStore[name] === undefined) {
        var param = { 'name': name };
        this.parameterStore[name] = paramIsMultiple(name) ? [ param ] : param;
      }
      return this.parameterStore[name];
    },
    
    /** Returns an array of values of all parameters with given name
      */
    getAllValues: function (name) {
      var val = null;
      if (this.parameterStore[name] !== undefined)
        val = !paramIsMultiple(name) ? this.parameterStore[name].value : this.parameterStore[name].map(function (p) { return p.value; });

      return val;
    }
  };
  
})(Solr, asSys);
