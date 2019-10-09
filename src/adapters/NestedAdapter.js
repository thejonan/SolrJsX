/** SolrJsX library - a neXt Solr queries JavaScript library.
 * Nested docs SOLR translation
 *
 * Author: Ivan (Jonan) Georgiev
 * Copyright © 2017-2019, IDEAConsult Ltd. All rights reserved.
 */

import a$ from 'as-sys';
import _ from 'lodash';

/**
 * The nested documents Solr data translation.
 */
function NestedAdapter(settings) {
	this.nestingField = settings && settings.nestingField || "type_s";
}

NestedAdapter.prototype = {
	init: function (manager) {
		// Let the other initializers do their job, like the Management, for example
		a$.pass(this, NestedAdapter, "init", manager);
	},

	parseResponse: function (data) {
		var response = a$.pass(this, NestedAdapter, "parseResponse", data) || data,
			docs = response.response.docs;

		for (var i = 0, dl = docs.length; i < dl; ++i) {
			var d = docs[i],
				ext = {};

			if (!d._childDocuments_)
				continue;

			for (var j = 0, cl = d._childDocuments_.length; j < cl; ++j) {
				var c = d._childDocuments_[j],
					type = c[this.nestingField];

				if (ext[type] === undefined)
					ext[type] = [];

				ext[type].push(c);
			}

			delete d._childDocuments_;
			d._extended_ = ext;
		}

		return {
			'entries': docs,
			'stats': _.extend({}, response.stats, response.responseHeader),
			'facets': response.facets,
			'paging': {
				'start': response.response.start,
				'count': response.response.docs.length,
				'total': response.response.numFound,
				'pageSize': parseInt(response.responseHeader.params.rows)
			}
		};
	}
};


export default NestedAdapter;