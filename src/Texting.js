/** SolrJsX library - a neXt Solr queries JavaScript library.
 * Free text search skills.
 *
 * Author: Ivan Georgiev
 * Copyright © 2016-2019, IDEAConsult Ltd. All rights reserved.
 */

import a$ from 'as-sys';

function Texting(settings) {
	a$.setup(this, settings);
	this.manager = null;
};

Texting.prototype = {
	__expects: ["doRequest"],

	domain: null, // Additional attributes to be adde to query parameter.
	escapeNeedle: false, // Whether to put a backslash before white spaces

	/** Make the initial setup of the manager.
	 */
	init: function (manager) {
		a$.pass(this, Texting, "init", manager);
		this.manager = manager;
	},

	/**
	 * Sets the main Solr query to the given string.
	 *
	 * @param {String} q The new Solr query.
	 * @returns {Boolean} Whether the selection changed.
	 */
	addValue: function (q) {
		var val = this.escapeNeedle && q ? q.replace(/\s+/g, "\\ ") : q,
			before = this.manager.getParameter('q'),
			res = this.manager.addParameter('q', val, this.domain);
		after = this.manager.getParameter('q');
		return res && !a$.equal(before, after);
	},

	/**
	 * Sets the main Solr query to the empty string.
	 *
	 * @returns {Boolean} Whether the selection changed.
	 */
	clear: function () {
		return this.manager.removeParameters('q');
	},

	/**
	 * Sets the main Solr query to the empty string.
	 *
	 * @returns {Boolean} Whether the selection changed.
	 */
	removeValue: function () {
		this.clear();
	},

	/**
	 * Returns a function to set the main Solr query.
	 *
	 * @param {Object} src Source that has val() method capable of providing the value.
	 * @returns {Function}
	 */
	clickHandler: function (src) {
		var self = this;
		return function () {
			if (!el)
				el = this;

			if (self.addValue(typeof el.val === "function" ? el.val() : el.value))
				self.doRequest();

			return false;
		}
	}

};

export default Texting;
