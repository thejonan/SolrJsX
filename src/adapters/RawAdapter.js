/** SolrJsX library - a neXt Solr queries JavaScript library.
 * Raw SOLR translation
 *
 * Author: Ivan (Jonan) Georgiev
 * Copyright © 2016-2019, IDEAConsult Ltd. All rights reserved.
 */

/**
 * Raw, non-nested Solr data translation.
 */
import a$ from 'as-sys';
import _ from "lodash";

function RawAdapter(settings) {
  a$.setup(this, settings);
}

RawAdapter.prototype = {
  collapseRules: {
    "study": {
      fields: /topcategory[_sh]*|endpointcategory[_sh]*|guidance[_sh]*|reference[_sh]*|reference_owner[_sh]*|reference_year[_sh]*|guidance[_sh]*/
    },
    "composition": {
      fields: /CORE|COATING|CONSTITUENT|ADDITIVE|IMPURITY|FUNCTIONALISATION|DOPING/
    }
  },

  init: function (manager) {
    // Let the other initializers, like the Management, for example
    a$.pass(this, RawAdapter, "init", manager);
  },

  parseResponse: function (data) {
    var docs = [],
      self = this,
      response = a$.pass(this, RawAdapter, "parseResponse", data) || data,
      filterProps = function (dout, din) {
        _.each(self.collapseRules, function (r, type) {
          var subdoc = {};

          _.each(din, function (v, k) {
            if (!k.match(r.fields))
              return;

            delete din[k];

            // smash these annoying multi-arrays.
            if (Array.isArray(v) && v.length == 1)
              v = v[0];

            subdoc[k] = v;
          });

          // now add this.
          if (dout._extended_ === undefined)
            dout._extended_ = {};

          if (dout._extended_[type] === undefined)
            dout._extended_[type] = [subdoc];
          else
            dout._extended_[type].push(subdoc);
        });

        // now process the remaining fields too            
        _.each(din, function (v, k) {
          // smash these annoying multi-arrays.
          if (Array.isArray(v) && v.length == 1)
            v = v[0];

          dout[k] = v;
        });
      };

    for (var i = 0, dl = response.response.docs.length; i < dl; ++i) {
      var din = response.response.docs[i],
        ein = response.expanded[din.s_uuid],
        dout = {};

      filterProps(dout, din);
      for (var j = 0, edl = ein.docs.length; j < edl; ++j)
        filterProps(dout, ein.docs[j]);

      docs.push(dout);
    }

    return {
      'entries': docs,
      'stats': _.extend({}, response.stats, response.responseHeader),
      'facets': _.extend({}, response.facet_counts.facet_fields || response.facets, response.facet_counts.facet_pivot),
      'paging': {
        'start': response.response.start,
        'count': response.response.docs.length,
        'total': response.response.numFound,
        'pageSize': parseInt(response.responseHeader.params.rows)
      }
    };
  }
};


export default RawAdapter;
