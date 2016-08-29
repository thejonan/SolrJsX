(function (Solr, a$) {
  /* http://wiki.apache.org/solr/SimpleFacetParameters */
  var FacetParameters = {
    'prefix': null,
    'sort': null,
    'limit': null,
    'offset': null,
    'mincount': null,
    'missing': null,
    'method': null,
    'enum.cache.minDf': null
  };
  
  Solr.Faceting = function (obj) {
    a$.extend(true, this, obj);
    this.manager = null;
  };
  
  Solr.Faceting.prototype = {
    multivalue: false,      // If this filter allows multiple values. Values can be arrays.
    exclusion: false,       // Whether to exclude THIS field from filtering from itself.
    onFilter: null,         // Invoked everytime an actual filter change happens. 
                            // If null or `true` is returned - the request is initiated.
    
    /** Make the initial setup of the manager for this faceting skill (field, exclusion, etc.)
      */
    init: function (manager) {
      this.manager = manager;
      this.fieldRegExp = new RegExp('^-?' + this.field + ':');
      
      var fpars = a$.extend({}, FacetParameters),
          locals = null,
          self = this;

      if (this.exclusion) {
        this.fieldLocals = { tag: this.field + "_ex" };
        locals = { ex: this.field + "_ex" };
      }

      this.manager.addParameter('facet', true);

      if (this.facet.date !== undefined) {
        this.manager.addParameter('facet.date', this.field, locals);
        a$.extend(fpars, {
          'date.start': null,
          'date.end': null,
          'date.gap': null,
          'date.hardend': null,
          'date.other': null,
          'date.include': null
        });
      }
      else if (this.facet.range !== undefined) {
        this.manager.addParameter('facet.range', this.field, locals);
        a$.extend(fpars, {
          'range.start': null,
          'range.end': null,
          'range.gap': null,
          'range.hardend': null,
          'range.other': null,
          'range.include': null
        });
      }
      // Set facet.field, facet.date or facet.range to truthy values to add
      // related per-field parameters to the parameter store.
      else
        this.manager.addParameter('facet.field', this.field, locals);
      
      fpars = a$.common(this.facet, fpars);
      a$.each(fpars, function (p, k) { 
        self.manager.addParameter('f.' + self.field + '.facet.' + k, p); 
      });
    },
    
    addValue: function (value, exclude) {
      if (this.multivalue === false)
        this.clearValues();
        
      var fq = this.fq(value, exclude);
        
      if (this.multivalue !== 'union')
        return this.manager.addParameter('fq', fq, this.fieldLocals);
        
      var indices = this.manager.findParameters('fq', this.fieldRegExp);
      if (!indices.length)
        return this.manager.addParameter('fq', "(" + fq + ")", this.fieldLocals);

      var param = this.manager.getParameter('fq', indices[0]);
      if (param.value.indexOf(fq) > -1)
        return false;
      
      param.value = param.value.replace(/\)\s*$/, " " + fq + ")");
      return true;
    },
    
    /**
     * Removes a value for filter query.
     *
     * @returns {Boolean} Whether a filter query was removed.
     */    
    removeValue: function (value) {
      if (this.multivalue === false)
        return this.clearValues();
      else if (this.multivalue !== 'union')
        return this.manager.removeParameters('fq', this.fq(value)) || this.manager.removeParameters('fq', this.fq(value, exclude));

      var indices = this.manager.findParameters('fq', this.fieldRegExp);
      if (!indices.length)
        return false;

      var param = this.manager.getParameter('fq', indices[0]);
      if (param.value.indexOf(fq) < 0)
        return false;
        
      param.value = param.value.replace(fq, "").replace(/\s+/g, " ");
      return true;
    },

    /**
     * Removes all filter queries using the widget's facet field.
     *
     * @returns {Boolean} Whether a filter query was removed.
     */
    clearValues: function () {
      return this.manager.removeParameters('fq', this.fieldRegExp);
    },
    
    /**
     * One of "facet.field", "facet.date" or "facet.range" must be set on the
     * widget in order to determine where the facet counts are stored.
     *
     * @returns {Array} An array of objects with the properties <tt>facet</tt> and
     * <tt>count</tt>, e.g <tt>{ facet: 'facet', count: 1 }</tt>.
     */
    getFacetCounts: function () {
      var property;
      if (this['facet.field'] !== undefined)
        property = 'facet_fields';
      else if (this['facet.date'] !== undefined)
        property = 'facet_dates';
      else if (this['facet.range'] !== undefined)
        property = 'facet_ranges';

      if (property !== undefined) {
        switch (this.manager.getParameter('json.nl').value) {
          case 'map':
            return this.getFacetCountsMap(property);
          case 'arrarr':
            return this.getFacetCountsArrarr(property);
          default:
            return this.getFacetCountsFlat(property);
        }
      }
      throw 'Cannot get facet counts unless one of the following properties is set to "true" on widget "' + this.id + '": "facet.field", "facet.date", or "facet.range".';
    },
    
    /**
     * Used if the facet counts are represented as a JSON object.
     *
     * @param {String} property "facet_fields", "facet_dates", or "facet_ranges".
     * @returns {Array} An array of objects with the properties <tt>facet</tt> and
     * <tt>count</tt>, e.g <tt>{ facet: 'facet', count: 1 }</tt>.
     */
    getFacetCountsMap: function (property) {
      var counts = [];
      for (var facet in this.manager.response.facet_counts[property][this.field]) {
        counts.push({
          facet: facet,
          count: parseInt(this.manager.response.facet_counts[property][this.field][facet])
        });
      }
      return counts;
    },
  
    /**
     * Used if the facet counts are represented as an array of two-element arrays.
     *
     * @param {String} property "facet_fields", "facet_dates", or "facet_ranges".
     * @returns {Array} An array of objects with the properties <tt>facet</tt> and
     * <tt>count</tt>, e.g <tt>{ facet: 'facet', count: 1 }</tt>.
     */
    getFacetCountsArrarr: function (property) {
      var counts = [];
      for (var i = 0, l = this.manager.response.facet_counts[property][this.field].length; i < l; i++) {
        counts.push({
          facet: this.manager.response.facet_counts[property][this.field][i][0],
          count: parseInt(this.manager.response.facet_counts[property][this.field][i][1])
        });
      }
      return counts;
    },
  
    /**
     * Used if the facet counts are represented as a flat array.
     *
     * @param {String} property "facet_fields", "facet_dates", or "facet_ranges".
     * @returns {Array} An array of objects with the properties <tt>facet</tt> and
     * <tt>count</tt>, e.g <tt>{ facet: 'facet', count: 1 }</tt>.
     */
    getFacetCountsFlat: function (property) {
      var counts = [];
      for (var i = 0, l = this.manager.response.facet_counts[property][this.field].length; i < l; i += 2) {
        counts.push({
          facet: this.manager.response.facet_counts[property][this.field][i],
          count: parseInt(this.manager.response.facet_counts[property][this.field][i+1])
        });
      }
      return counts;
    },
    
    /**
     * @param {String} value The value.
     * @returns {Function} Sends a request to Solr if it successfully adds a
     *   filter query with the given value.
     */
    clickHandler: function (value) {
      var self = this;
      return function (e) {
        if (self.addValue(value))
          self.manager.doRequest();
          
        return false;
      };
    },

    /**
     * @param {String} value The value.
     * @returns {Function} Sends a request to Solr if it successfully removes a
     *   filter query with the given value.
     */
    unclickHandler: function (value) {
      var self = this;
      return function (e) {
        if (self.removeValue(value))
          self.manager.doRequest();
          
        return false;
      };
    },
     /**
     * @param {String} value The facet value.
     * @param {Boolean} exclude Whether to exclude this fq parameter value.
     * @returns {String} An fq parameter value.
     */
    fq: function (value, exclude) {
      return (exclude ? '-' : '') + this.field + ':' + Solr.quoteValue(value);
    }
  };
  
})(Solr, a$);
