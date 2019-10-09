/** SolrJsX library - a neXt Solr queries JavaScript library.
 * Added ability to give pattern to text/facet/range values.
 *
 * Author: Ivan Georgiev
 * Copyright © 2017-2019, IDEAConsult Ltd. All rights reserved.
 */

import _ from 'lodash';

function Patterning(settings) {
	this.valuePattern = settings && settings.valuePattern || this.valuePattern;
	var oldRE = this.fqRegExp.toString().replace(/^\/\^?|\$?\/$/g, ""),
		newRE = "^" +
		_.escapeRegExp(this.valuePattern.replace(/\{\{!?-\}\}/g, "-?").replace("{{v}}", "__v__"))
		.replace("__v__", oldRE)
		.replace("--?", "-?")
		.replace("--", "");

	this.fqRegExp = new RegExp(newRE);
};

Patterning.prototype = {
	valuePattern: "{{-}}{{v}}", // The default pattern.

	fqValue: function (value, exclude) {
		return this.valuePattern
			.replace("{{-}}", exclude ? "-" : "") // place the exclusion...
			.replace("{{!-}}", exclude ? "" : "-") // ... or negative exclusion.
			.replace("{{v}}", a$.pass(this, Solr.Patterning, "fqValue", value, exclude)) // now put the actual value
			.replace("--", ""); // and make sure there is not double-negative. TODO!
	}

};

export default Patterning;
