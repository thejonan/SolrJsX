/** SolrJsX library - a neXt Solr queries JavaScript library.
  * Faceting skills - maintenance of appropriate parameters.
  *
  * Author: Ivan Georgiev
  * Copyright © 2016, IDEAConsult Ltd. All rights reserved.
  */
  
  
(function (Solr, a$){
  
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
  },
  leadBracket = /\s*\(\s*?/,
  rearBracket = /\s*\)\s*$/;

/**
  * Forms the string for filtering of the current facet value
  */
Solr.facetValue = function (value) {
  if (!Array.isArray(value))
    return Solr.escapeValue(value);
  else if (value.length == 1)
    return Solr.escapeValue(value[0]);
  else
    return "(" + value.map(function (v) { return Solr.escapeValue(v); }).join(" ") + ")";
};

/**
 * Parses a facet filter from a parameter.
 *
 * @returns {Object} { field: {String}, value: {Combined}, exclude: {Boolean} }.
 */ 
Solr.parseFacet = function (value) {
  var m = value.match(/^(-)?([^\s:]+):(.+)$/);
  
  if (!m)
    return null;
  var res = { field: m[2], exclude: !!m[1] },
      sarr = m[3].replace(leadBracket, "").replace(rearBracket, "").replace(/\\"/g, "%0022").match(/[^\s"]+|"[^"]+"/g);

  for (var i = 0, sl = sarr.length; i < sl; ++i)
    sarr[i] = sarr[i].replace(/^"/, "").replace(/"$/, "").replace("%0022", '"');
  
  res.value = sl > 1 ? sarr : sarr[0];
  return res;
};


Solr.Faceting = function (obj) {
  a$.extend(true, this, obj);
  this.manager = null;
  
  // We cannot have aggregattion if we don't have multiple values.
  if (!this.multivalue)
    this.aggregate = false;

  this.fieldRegExp = new RegExp('^-?' + this.field + ':');
};

Solr.Faceting.prototype = {
  multivalue: false,      // If this filter allows multiple values. Values can be arrays.
  aggregate: false,       // If additional values are aggregated in one filter.
  exclusion: false,       // Whether to exclude THIS field from filtering from itself.
  domain: null,           // Some local attributes to be added to each parameter
  useJson: false,         // Whether to use the Json Facet API.
  facet: { },             // A default, empty definition.
  
  /** Make the initial setup of the manager for this faceting skill (field, exclusion, etc.)
    */
  init: function (manager) {
    a$.pass(this, Solr.Faceting, "init", manager);
    this.manager = manager;
    
    var fpars = a$.extend({}, FacetParameters),
        domain = null,
        self = this;

    if (this.exclusion) {
      this.domain = a$.extend(this.domain, { tag: this.id + "_tag" });
      domain = { ex: this.id + "_tag" };
    }

    if (this.useJson) {
      var facet = { type: "terms", field: this.field, mincount: 1, limit: -1 };

      this.fqName = "json.filter";
      if (domain != null)
        facet.domain = { excludeTags: domain.ex };
  
      this.manager.addParameter('json.facet.' + this.id, a$.extend(facet, this.facet));
    }
    else {
      this.fqName = "fq";
      this.manager.addParameter('facet', true);
      
      if (this.facet.date !== undefined) {
        this.manager.addParameter('facet.date', this.field, domain);
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
        this.manager.addParameter('facet.range', this.field, domain);
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
      else {
        this.facet.field = true;
        this.manager.addParameter('facet.field', this.field, domain);
      }
      
      fpars = a$.common(this.facet, fpars);
      a$.each(fpars, function (p, k) { 
        self.manager.addParameter('f.' + self.field + '.facet.' + k, p); 
      });
    }
  },
  
  /**
   * Add a facet filter parameter to the Manager
   *
   * @returns {Boolean} Whether the filter was added.
   */    

  addValue: function (value, exclude) {
    if (!this.multivalue)
      this.clearValues();

    var index;
    if (!this.aggregate || !(index = this.manager.findParameters(this.fqName, this.fieldRegExp)).length)
      return this.manager.addParameter(this.fqName, this.fq(value, exclude), this.domain);
      
    // No we can obtain the parameter for aggregation.
    var param = this.manager.getParameter(this.fqName, index[0]),
        parsed = Solr.parseFacet(param.value),
        added = false;
    
    if (!Array.isArray(value))
      value = [value];
    for (var v, i = 0, vl = value.length; i < vl; ++i) {
      v = value[i];
      if (parsed.value == v)
        continue;
      else if (Array.isArray(parsed.value) && parsed.value.indexOf(v) >= 0)
        continue;
        
      if (typeof parsed.value === 'string')
        parsed.value = [ parsed.value ];
      parsed.value.push(v);
      added = true;
    }
    
    if (!added)
      return false;
    
    param.value = this.fq(parsed.value, exclude);
    return true;
  },
  
  /**
   * Removes a value for filter query.
   *
   * @returns {Boolean} Whether a filter query was removed.
   */    
  removeValue: function (value) {
    if (!this.multivalue)
      return this.clearValues();
    else {
      var self = this,
          removed = false;

      this.manager.removeParameters(this.fqName, function (p) {
        var parse, rr;

        if (!p.value.match(self.fieldRegExp))
          return false;
        else if (!self.aggregate) {
          removed = removed || (rr = p.value.indexOf(Solr.facetValue(value)) >= 0);
          return rr;
        }
        
        parse = Solr.parseFacet(p.value);
        if (!Array.isArray(value))
          value = [ value ];
          
        if (!Array.isArray(parse.value)) {
          removed = removed || (rr = value.indexOf(parse.value) >= 0);
          return rr;
        }
          
        parse.value = parse.value.filter(function (v){
          if (value.indexOf(v) == -1)
            return true;
          else {
            removed = true;
            return false;
          }
        });
        
        if (!parse.value.length)
          return true;
        else if (parse.value.length == 1)
          parse.value = parse.value[0];
          
        p.value = self.fq(parse.value);
        return false;
      });
      
      return removed;
    }
  },
  
  /**
   * Tells whether given value is part of facet filter.
   *
   * @returns {Boolean} If the given value can be found
   */      
  hasValue: function (value) {
    var indices = this.manager.findParameters(this.fqName, this.fieldRegExp),
        value = Solr.escapeValue(value);
        
    for (var p, i = 0, il = indices.length; i < il; ++i) {
      p = this.manager.getParameter(this.fqName, indices[i]);
      if (p.value.replace(this.fieldRegExp, "").indexOf(value) > -1)
        return true;
    }
    
    return false;
  },
  
  /**
   * Removes all filter queries using the widget's facet field.
   *
   * @returns {Boolean} Whether a filter query was removed.
   */
  clearValues: function () {
    return this.manager.removeParameters(this.fqName, this.fieldRegExp);
  },
  
  /**
   * One of "facet.field", "facet.date" or "facet.range" must be set on the
   * widget in order to determine where the facet counts are stored.
   *
   * @returns {Array} An array of objects with the properties <tt>facet</tt> and
   * <tt>count</tt>, e.g <tt>{ facet: 'facet', count: 1 }</tt>.
   */
  getFacetCounts: function (facet_counts) {
    var property;
    
    if (facet_counts == null)
      facet_counts = this.manager.response.facet_counts;
      
    if (this.useJson === true)
      return facet_counts[this.id].buckets;
    else if (this.facet.field !== undefined)
      property = 'facet_fields';
    else if (this.facet.date !== undefined)
      property = 'facet_dates';
    else if (this.facet.range !== undefined)
      property = 'facet_ranges';

    if (property !== undefined) {
      switch (this.manager.getParameter('json.nl').value) {
        case 'map':
          return this.getFacetCountsMap(facet_counts, property);
        case 'arrarr':
          return this.getFacetCountsArrarr(facet_counts);
        default:
          return this.getFacetCountsFlat(facet_counts);
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
  getFacetCountsMap: function (facet_counts, property) {
    var counts = [];
    for (var facet in facet_counts[property][this.id]) {
      counts.push({
        val: facet,
        count: parseInt(facet_counts[property][this.id][facet])
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
  getFacetCountsArrarr: function (facet_counts, property) {
    var counts = [];
    for (var i = 0, l = facet_counts[property][this.id].length; i < l; i++) {
      counts.push({
        val: facet_counts[property][this.id][i][0],
        count: parseInt(facet_counts[property][this.id][i][1])
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
  getFacetCountsFlat: function (facet_counts, property) {
    var counts = [];
    for (var i = 0, l = facet_counts[property][this.id].length; i < l; i += 2) {
      counts.push({
        val: facet_counts[property][this.id][i],
        count: parseInt(facet_counts[property][this.id][i + 1])
      });
    }
    return counts;
  },
  
  /** A Wrapped for consolidating the request making.
    */
  doRequest: function () {
    this.manager.addParameter('start', 0);
    this.manager.doRequest();
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
        self.doRequest();
        
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
        self.doRequest();
        
      return false;
    };
  },
   /**
   * @param {String} value The facet value.
   * @param {Boolean} exclude Whether to exclude this fq parameter value.
   * @returns {String} An fq parameter value.
   */
  fq: function (value, exclude) {
    return (exclude ? '-' : '') + this.field + ':' + Solr.facetValue(value);
  }
};

})(Solr, asSys);
