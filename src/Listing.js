/** SolrJsX library - a neXt Solr queries JavaScript library.
 * Result list tunning and preparation.
 *
 * Author: Ivan Georgiev
 * Copyright © 2017-2019, IDEAConsult Ltd. All rights reserved.
 */

import a$ from 'as-sys';
import _ from 'lodash';

var defSettings = {
	nestingRules: null, // If document nesting is present - here are the rules for it.
	nestingField: null, // The default nesting field.
	nestLevel: null, // Inform which level needs to be nested into the listing.
	listingFields: ["*"], // The fields that need to be present in the result list.
};

function Listing(settings) {
	a$.setup(this, defSettings, settings);
	this.manager = null;
};

/** Make the initial setup of the manager.
 */
Listing.prototype.init = function (manager) {
	a$.pass(this, Listing, 'init', manager);

	if (this.nestLevel != null) {
		var level = this.nestingRules[this.nestLevel],
			chF = level.field || this.nestingField,
			parF = this.nestingRules[level.parent] && this.nestingRules[level.parent].field || this.nestingField;

		manager.addParameter('fl',
			"[child parentFilter=" + parF + ":" + level.parent +
			" childFilter=" + chF + ":" + this.nestLevel +
			" limit=" + level.limit + "]");
	}

	_.each(this.listingFields, function (f) {
		manager.addParameter('fl', f)
	});
};

export default Listing;
