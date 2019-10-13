/** SolrJsX library - a neXt Solr queries JavaScript library.
 * URL querying skills - stacking up all parameters for URL-baesd query.
 *
 * Author: Ivan Georgiev
 * Copyright © 2016, IDEAConsult Ltd. All rights reserved.
 */

import a$ from 'as-sys';

import Solr from './Core';

var defSettings = {
	serverUrl: null,
	servlet: "select",
};

function QueryingURL(settings) {
	a$.setup(this, defSettings, settings);
};

QueryingURL.prototype.__expects = ["enumerateParameters"];

QueryingURL.prototype.prepareQuery = function (servlet) {
	var query = [];

	this.enumerateParameters(function (param) {
		var p = Solr.stringifyParameter(param);
		if (p != null)
			query.push(p);
	});

	return {
		url: Solr.buildUrl(this.serverUrl, (servlet || this.servlet), query)
	};
};

QueryingURL.prototype.parseResponse = function (response) {
	return response;
};

export default QueryingURL;