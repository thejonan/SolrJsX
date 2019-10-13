/** SolrJsX library - a neXt Solr queries JavaScript library.
 * Persistentcy for configured parameters skills.
 *
 * Author: Ivan Georgiev
 * Copyright © 2016-2019, IDEAConsult Ltd. All rights reserved.
 */

import a$ from 'as-sys';

var defSettings = {
	persistentParams: [], // Parameters that need to stay persistent between calls.
};

function Persisting(settings) {
	this.persistentParams = (settings && settings.persistentParams) || defSettings.persistentParams;
	this.storage = {};
};

Persisting.prototype.addParameter = function (param, value, domain) {
	// TODO Check if the parameter is persistent and store it.

	// And make the call to the "super".
	a$.pass(this, "addParameter", Solf.Configuring, param, value, domain);
	return param;
};

/** Remove parameters. If needle is an array it is treated as an idices array,
 * if not - it is first passed to findParameters() call.
 */
Persisting.prototype.removeParameters = function (indices) {
	// TODO Check if the parameter is persistent and store it.

	// And make the call to the "super".
	a$.pass(this, "removeParameters", Solf.Configuring, indices);
};

/** The method that is invoked just before making the actual request.
 */
Persisting.prototype.onPrepare = function (settings) {

};

export default Persisting;