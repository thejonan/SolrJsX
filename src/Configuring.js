/** SolrJsX library - a neXt Solr queries JavaScript library.
 *
 * Parameter management skills. Primary based on this description:
 * http://yonik.com/solr-json-request-api/#Smart_merging_of_multiple_JSON_parameters
 *
 * Author: Ivan Georgiev
 * Copyright © 2016-2019, IDEAConsult Ltd. All rights reserved.
 */

import a$ from 'as-sys';
import _ from 'lodash';
import Solr from "./Core";

var paramIsMultiple = function (name) {
	return name.match(/^(?:bf|bq|facet\.date|facet\.date\.other|facet\.date\.include|facet\.field|facet\.pivot|facet\.range|facet\.range\.other|facet\.range\.include|facet\.query|fq|fl|json\.query|json\.filter|group\.field|group\.func|group\.query|pf|qf|stats\.field)$/);
};

function Configuring(settings) {
	// Now make some reformating of initial parameters.
	this.parameterHistory = [];

	this.resetParameters();
	this.mergeParameters(settings && settings.parameters);
};


/** 
 * Add a parameter. If `param` is an object - it is treated as a prepared
 * parameter and `value` and `domain` are ignored, otherwise `param` is
 * treated as a _name_.
 */
Configuring.prototype.addParameter = function (param, value, domain) {
	var name;

	if (typeof param !== 'object') {
		name = param;
		param = {
			'name': param,
			'value': value
		};
		if (domain != null)
			param.domain = domain;
	} else
		name = param.name;

	if (paramIsMultiple(name)) {
		if (this.parameterStore[name] === undefined)
			this.parameterStore[name] = [param];
		else {
			var found = false;
			_.each(this.parameterStore[name], function (p) {
				found = found || a$.equal(true, param, p);
			});
			if (!found)
				this.parameterStore[name].push(param);
			else
				return false;
		}
	} else
		this.parameterStore[name] = param;

	return param;
};

/** Find all parameters matching the needle - it can be RegExp, string, etc.
 * Always returns an array of indices - it could be empty, but is an array.
 */
Configuring.prototype.findParameters = function (name, needle) {
	var indices = [],
		filter;
	if (this.parameterStore[name] !== undefined) {
		if (typeof needle === 'function') {
			filter = function (p, i) {
				if (needle(p, i))
					indices.push(i);
			};
		} else if (needle == null) {
			filter = function (p, i) {
				indices.push(i);
			};
		} else {
			if (typeof needle !== 'object' || needle instanceof RegExp || Array.isArray(needle))
				needle = {
					'value': needle
				};

			filter = function (p, i) {
				if (a$.similar(p, needle))
					indices.push(i);
			};
		}

		_.each(paramIsMultiple(name) ? this.parameterStore[name] : [this.parameterStore[name]], filter);
	}
	return indices;
};

/** Remove parameters. If needle is an array it is treated as an idices array,
 * if not - it is first passed to findParameters() call.
 */
Configuring.prototype.removeParameters = function (name, indices) {
	if (this.parameterStore[name] !== undefined) {
		if (typeof indices === 'number')
			indices = [indices];
		else if (!Array.isArray(indices))
			indices = this.findParameters(name, indices);

		if (!paramIsMultiple(name) || indices.length == this.parameterStore[name].length)
			delete this.parameterStore[name];
		else {
			indices.sort(function (a, b) {
				return a < b ? -1 : a > b ? 1 : 0;
			});
			// We need to traverse in reverse, relying that the indices are ascending.
			for (var i = indices.length - 1; i >= 0; --i)
				this.parameterStore[name].splice(indices[i], 1);
		}

		return indices.length;
	} else
		return false;
};

/** Returns a parameter or an array of parameters with that name
 */
Configuring.prototype.getParameter = function (name, index) {
	var multi = paramIsMultiple(name);

	if (this.parameterStore[name] === undefined)
		return multi && index == null ? [] : {
			'name': name
		};
	else
		return (index == null || !multi) ? this.parameterStore[name] : this.parameterStore[name][index];
};

/** Returns an array of values of all parameters with given name
 */
Configuring.prototype.getAllValues = function (name) {
	var val = null;
	if (this.parameterStore[name] !== undefined)
		val = !paramIsMultiple(name) ? this.parameterStore[name].value : this.parameterStore[name].map(function (p) {
			return p.value;
		});

	return val;
};

/** Merge the parameters from the given map into the current ones
 */
Configuring.prototype.mergeParameters = function (parameters) {
	var self = this;
	_.each(parameters, function (p, name) {
		if (typeof p === 'string')
			self.addParameter(Solr.parseParameter(name + '=' + p));
		else
			self.addParameter(name, p);
	});
};

/** Iterate over all parameters - including array-based, etc.
 */
Configuring.prototype.enumerateParameters = function (deep, callback) {
	if (typeof deep !== 'boolean') {
		callback = deep;
		deep = true;
	}
	_.each(this.parameterStore, function (p) {
		if (deep && Array.isArray(p))
			_.each(p, callback);
		else if (p !== undefined)
			callback(p);
	});
};

/** Clears all the parameter store
 */
Configuring.prototype.resetParameters = function () {
	this.parameterStore = {};
};

/** Saves the current set of parameters and "opens" a new one, 
 * depending on the argument:
 *
 * @param {Boolean|Oblect} copy  If it is an object - uses it directly as a new parameter store,
 *                               if it is a boolean - determines whether to keep the old one.
 */
Configuring.prototype.pushParameters = function (copy) {
	this.parameterHistory.push(this.parameterStore);
	if (typeof copy === "object")
		this.parameterStore = copy;
	else if (copy === false)
		this.parameterStore = {};
	else
		this.parameterStore = _.merge({}, this.parameterStore);
};

/** Pops the last saved parameters, discarding (and returning) the current one.
 */
Configuring.prototype.popParameters = function () {
	var ret = this.parameterStore;
	this.parameterStore = this.parameterHistory.pop();
	return ret;
};

export default Configuring;