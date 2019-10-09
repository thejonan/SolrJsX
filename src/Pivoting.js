/** SolrJsX library - a neXt Solr queries JavaScript library.
 * Pivoting, i.e. nested faceting skils.
 *
 * Author: Ivan Georgiev
 * Copyright © 2017-2019, IDEAConsult Ltd. All rights reserved.
 */

import a$ from 'as-sys';
import _ from 'lodash';

import DefaultFaceter from './Faceting';

function Pivoting(settings) {
	a$.setup(this, settings);
	this.manager = null;
	this.faceters = {};

	this.id = settings.id;
	this.settings = settings;
	this.rootId = null;
};

Pivoting.prototype = {
	pivot: null, // If document nesting is present - here are the rules for it.
	useJson: false, // Whether to prepare everything with Json-based parameters.
	statistics: null, // The per-facet statistics that are needed.
	domain: null, // The default domain for requests

	/** Creates a new faceter for the corresponding level
	 */
	addFaceter: function (facet, idx) {
		return new DefaultFaceter(facet);
	},

	/** Make the initial setup of the manager.
	 */
	init: function (manager) {
		a$.pass(this, Solr.Pivoting, 'init', manager);

		this.manager = manager;

		var stats = this.statistics;
		if (!this.useJson) {
			// TODO: Test this!
			var loc = {};
			if (!!stats) {
				loc.stats = this.id + "_stats";
				Solr.facetStats(this.manager, loc.stats, stats);

				// We clear this to avoid later every faceter from using it.
				stats = null;
			}

			if (this.exclusion)
				loc.ex = this.id + "_tag";

			this.manager.addParameter('facet.pivot', this.pivot.map(function (f) {
				return (typeof f === "string") ? f : f.field;
			}).join(","), loc);
		}

		var location = "json";
		for (var i = 0, pl = this.pivot.length; i < pl; ++i) {
			var p = this.pivot[i],
				f = _.merge({}, this.settings, typeof p === "string" ? {
					id: p,
					field: p,
					disabled: true
				} : p);

			location += ".facet." + f.id;
			if (this.useJson)
				f.jsonLocation = location;
			if (this.rootId == null)
				this.rootId = f.id;

			// TODO: Make these work some day
			f.exclusion = false;

			// We usually don't need nesting on the inner levels.
			if (p.nesting == null && i > 0)
				delete f.nesting;

			f.statistics = stats;

			(this.faceters[f.id] = this.addFaceter(f, i)).init(manager);
		}
	},

	getPivotEntry: function (idx) {
		var p = this.pivot[idx];
		return p === undefined ? null : (typeof p === "object" ? p : {
			id: p,
			field: p
		});
	},

	getFaceterEntry: function (idx) {
		var p = this.pivot[idx];
		return this.faceters[typeof p === "string" ? p : p.id];
	},

	getPivotCounts: function (pivot_counts) {
		if (this.useJson === true) {
			if (pivot_counts == null)
				pivot_counts = this.manager.response.facets;

			return pivot_counts.count > 0 ? pivot_counts[this.rootId].buckets : [];
		} else {
			if (pivot_counts == null)
				pivot_counts = this.manager.response.pivot;

			throw {
				error: "Not supported for now!"
			}; // TODO!!!
		}
	},

	addValue: function (value, exclude) {
		var p = this.parseValue(value);
		return this.faceters[p.id].addValue(p.value, exclude);
	},

	removeValue: function (value) {
		var p = this.parseValue(value);
		return this.faceters[p.id].removeValue(p.value);
	},

	clearValues: function () {
		_.each(this.faceters, function (f) {
			f.clearValues();
		});
	},

	hasValue: function (value) {
		var p = this.parseValue(value);
		return p.id != null ? this.faceters[p.id].hasValue(p.value) : false;
	},

	parseValue: function (value) {
		var m = value.match(/^(\w+):(.+)$/);
		return !m || this.faceters[m[1]] === undefined ? {
			value: value
		} : {
			value: m[2],
			id: m[1]
		};
	},

	/**
	 * @param {String} value The stringified facet value
	 * @returns {Object|String} The value that produced this output
	 */
	fqParse: function (value) {
		var p = this.parseValue(value),
			v = null;

		if (p.id != null)
			v = this.faceters[p.id].fqParse(p.value);
		else
			for (var id in this.faceters) {
				v = this.faceters[id].fqParse(p.value);
				if (!!v) {
					p.id = id;
					break;
				}
			}

		if (Array.isArray(v))
			v = v.map(function (one) {
				return p.id + ":" + one;
			});
		else if (v != null)
			v = p.id + ":" + v;

		return v;
	}

};

export default Pivoting;
