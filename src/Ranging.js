/** SolrJsX library - a neXt Solr queries JavaScript library.
 * Ranging skills - maintenance of appropriate parameters.
 *
 * Author: Ivan Georgiev
 * Copyright © 2017-2019, IDEAConsult Ltd. All rights reserved.
 */

import a$ from 'as-sys';
import _ from 'lodash';

import Solr from './Core';

/**
 * Forms the string for filtering of the current facet value
 */
function rangeValue(value) {
	return Array.isArray(value) ? "[" + Solr.escapeValue(value[0] || "*") + " TO " + Solr.escapeValue(value[1] || "*") + "]" : Solr.escapeValue(value);
};

/**
 * Parses a facet filter from a parameter.
 *
 * @returns {Object} { field: {String}, value: {Combined}, exclude: {Boolean} }.
 */
function parseRange(value) {
	var m = value.match(/(-?)([^\s:]+):\s*\[\s*([^\s]+)\s+TO\s+([^\s]+)\s*\]/);
	return !!m ? {
		field: m[2],
		exclude: !!m[1],
		value: [m[3], m[4]]
	} : null
};



function Ranging(settings) {
	this.field = this.id = null;

	a$.setup(this, settings);
	this.manager = null;

	this.fqRegExp = new RegExp("^-?" + Solr.escapeField(this.field).replace("\\", "\\\\") + ":\\s*\\[\\s*([^\\s])+\\s+TO\\s+([^\\s])+\\s*\\]");
	this.fqName = this.useJson ? "json.filter" : "fq";
	if (this.exclusion)
		this.domain = _.merge(this.domain, {
			tag: this.id + "_tag"
		});
};

Ranging.prototype = {
	multirange: false, // If this filter allows union of multiple ranges.  
	exclusion: false, // Whether to exclude THIS field from filtering from itself.
	domain: null, // Some local attributes to be added to each parameter.
	useJson: false, // Whether to use the Json Facet API.
	domain: null, // The default, per request local (domain) data.

	/** Make the initial setup of the manager.
	 */
	init: function (manager) {
		a$.pass(this, Ranging, "init", manager);
		this.manager = manager;
	},

	/**
	 * Add a range filter parameter to the Manager
	 *
	 * @returns {Boolean} Whether the filter was added.
	 */

	addValue: function (value, exclude) {
		// TODO: Handle the multirange case.
		this.clearValues();
		return this.manager.addParameter(this.fqName, this.fqValue(value, exclude), this.domain);
	},

	/**
	 * Removes a value for filter query.
	 *
	 * @returns {Boolean} Whether a filter query was removed.
	 */
	removeValue: function (value) {
		// TODO: Handle the multirange case.
		return this.clearValues();
	},

	/**
	 * Tells whether given value is part of range filter.
	 *
	 * @returns {Boolean} If the given value can be found
	 */
	hasValue: function (value) {
		// TODO: Handle the multirange case.
		return this.manager.findParameters(this.fqName, this.fqRegExp) != null;
	},

	/**
	 * Removes all filter queries using the widget's range field.
	 *
	 * @returns {Boolean} Whether a filter query was removed.
	 */
	clearValues: function () {
		return this.manager.removeParameters(this.fqName, this.fqRegExp);
	},

	/**
	 * @param {String} value The range value.
	 * @param {Boolean} exclude Whether to exclude this fq parameter value.
	 * @returns {String} An fq parameter value.
	 */
	fqValue: function (value, exclude) {
		return (exclude ? '-' : '') + Solr.escapeField(this.field) + ':' + rangeValue(value);
	},

	/**
	 * @param {String} value The range value.
	 * @param {Boolean} exclude Whether to exclude this fq parameter value.
	 * @returns {String} An fq parameter value.
	 */
	fqParse: function (value) {
		var m = value.match(this.fqRegExp);
		if (!m)
			return null;
		m.shift();
		return m;
	}

};

export default Ranging;
