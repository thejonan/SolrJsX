/** SolrJsX library - a neXt Solr queries JavaScript library.
 * Spying, i.e. alternative requesting skill.
 *
 * Author: Ivan Georgiev
 * Copyright © 2017-2019, IDEAConsult Ltd. All rights reserved.
 */

import a$ from 'as-sys';
import _ from 'lodash';

function Spying(settings) {
	a$.setup(this, settings);
	this.manager = null;
};

Spying.prototype = {
	servlet: null, // The custom servlet to use for the request

	/** Make the initial setup of the manager.
	 */
	init: function (manager) {
		a$.pass(this, Spying, "init", manager);
		this.manager = manager;
	},

	/** Make the actual request.
	 */
	doSpying: function (settings, callback) {
		var man = this.manager;

		man.pushParameters(true);
		if (typeof settings === "function")
			settings(man);
		else _.each(settings, function (v, k) {
			if (v == null)
				man.removeParameters(k);
			else if (Array.isArray(v))
				_.each(v, function (vv) {
					man.addParameter(k, vv);
				});
			else if (typeof v === "object")
				man.addParameter(v);
			else
				man.addParameter(k, v);
		});

		man.doRequest(this.servlet, callback || this.onSpyResponse);
		man.popParameters();
	}

};

export default Spying;
