/** SolrJsX library - a neXt Solr queries JavaScript library.
 * SolrAjax compatibility skills.
 *
 * Author: Ivan Georgiev
 * Copyright © 2016-2019, IDEAConsult Ltd. All rights reserved.
 */

import a$ from 'as-sys';

var defSettings = {
	store: {
		addByValue: function (name, value, locals) {
			return this.root.addParameter(name, value, locals);
		},
		removeByValue: function (name, value) {
			return this.root.removeParameters(name, indices);
		},
		find: function (name, needle) {
			return this.root.findParameters(name, neddle);
		},

		// TODO: Add another ParameterStore methods
	}
};

function Compatibility(settings) {
	a$.setup(this, defSettings, settings);
	this.store.root = this;
};

// TODO: Add AjaxSolr.AbstractManager methods that differ from ours.
// Compatibility.prototype ...

export default Compatibility;