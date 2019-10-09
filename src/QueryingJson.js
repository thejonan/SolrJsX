/** SolrJsX library - a neXt Solr queries JavaScript library.
 * Json querying skills - putting all appropriate parameters
 * for JSON based query.
 *
 * Author: Ivan Georgiev
 * Copyright © 2016-2019, IDEAConsult Ltd.
 */

import a$ from 'as-sys';
import _ from 'lodash';

import Solr from './Core';

var paramIsUrlOnly = function (name) {
	return name.match(/^(json\.nl|json\.wrf|q|wt|start)/);
};

var paramJsonName = function (name) {
	var m = name.match(/^json\.?(.*)/);
	return m && m[1];
};

function QueryingJson(settings) {
	a$.setup(this, settings);
};

QueryingJson.prototype = {
	__expects: ["enumerateParameters"],
	useBody: true,
	servlet: "select",
	serverUrl: null,

	prepareQuery: function () {
		var query = [],
			json = { 'params': {} },
			paramValue = function (param) {
				if (paramIsUrlOnly(param.name)) {
					query.push(Solr.stringifyParameter(param));
					return;
				}

				// Now, make the rest of the test.
				var val = null;

				if (typeof param.value === 'string')
					val = Solr.stringifyDomain(param) + param.value;
				else if (param.domain !== undefined)
					val = _.extend({}, param.value, {
						'domain': param.domain
					});
				else
					val = param.value;

				return val;
			};

		// make shallow enumerator so that arrays are saved as such.
		this.enumerateParameters(false, function (param) {
			// Take care for some very special parameters...
			var val = !Array.isArray(param) ? paramValue(param) : param.map(paramValue),
				name = !Array.isArray(param) ? param.name : param[0].name,
				jname = paramJsonName(name);

			if (val == undefined)
				return;
			else if (jname !== null)
				_.set(json, jname, val);
			else
				json.params[name] = val;
		});

		json = JSON.stringify(json);
		if (!this.useBody) {
			query.push(encodeURIComponent(json));
			return {
				url: Solr.buildUrl(this.serverUrl, this.servlet, query)
			};
		} else
			return {
				url: Solr.buildUrl(this.serverUrl, this.servlet, query),
				data: json,
				contentType: "application/json",
				type: "POST",
				method: "POST"
			};
	},

	parseResponse: function (response) {
		if (response.responseHeader.params && response.responseHeader.params.json != null) {
			var json = JSON.parse(response.responseHeader.params.json);
			_.extend(response.responseHeader.params, json, json.params);
			delete response.responseHeader.params.json;
		}

		return response;
	}
};

export default QueryingJson;
