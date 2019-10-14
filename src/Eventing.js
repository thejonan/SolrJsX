/** SolrJsX library - a neXt Solr queries JavaScript library.
 * Simple indoor request on event handling skills.
 *
 * Author: Ivan Georgiev
 * Copyright © 2017-2019, IDEAConsult Ltd. All rights reserved.
 */

import a$ from 'as-sys';

var defSettings = {
	resetPage: true, // Whether to reset to the first page on each requst.
	privateRequest: false, // Whether the request made should be private, i.e. ignoreing registered listeners.
	customResponse: null, // A custom response function, which if present invokes private doRequest.
};

function Eventing(settings) {
	a$.setup(this, defSettings, settings);
	this.manager = null;
};

/** Make the initial setup of the manager.
 */
Eventing.prototype.init = function (manager) {
	a$.pass(this, Eventing, "init", manager);
	this.manager = manager;
};

/** Make the actual request.
 */
Eventing.prototype.doRequest = function () {
	if (this.resetPage)
		this.manager.addParameter('start', 0);

	this.manager.doRequest(null, self.privateRequest, self.customResponse);
};

/**
 * @param {...} args Some parameter that will be transfered to addValue call
 * @returns {Function} Sends a request to Solr if it successfully adds a
 *   filter query with the given value.
 */
Eventing.prototype.updateHandler = function () {
	var self = this,
		args = arguments;

	return function () {
		var res = self.addValue.apply(self, args);
		if (res)
			self.doRequest();

		return res;
	};
};

/**
 * @param {...} args All the arguments are directly re-passed to `addValue` call.
 * @returns {Function} Sends a request to Solr if it successfully adds a
 *   filter query with the given value.
 */
Eventing.prototype.clickHandler = function () {
	var self = this,
		args = arguments;

	return function (e) {
		if (self.addValue.apply(self, args))
			self.doRequest();

		return false;
	};
};

/**
 * @param {...} args All the arguments are directly re-passed to `removeValue` call.
 * @returns {Function} Sends a request to Solr if it successfully removes a
 *   filter query with the given value.
 */
Eventing.prototype.unclickHandler = function () {
	var self = this,
		args = arguments;

	return function (e) {
		if (self.removeValue.apply(self, args))
			self.doRequest();

		return false;
	};
};

export default Eventing;