/** SolrJsX library - a neXt Solr queries JavaScript library.
 * Paging skills
 *
 * Author: Ivan Georgiev
 * Copyright © 2016-2019, IDEAConsult Ltd. All rights reserved.
 */

import a$ from 'as-sys';

var defSettings = {
	pageSize: 20, // The default page size
	domain: null
};

function Paging(settings) {
	a$.setup(this, defSettings, settings);

	this.manager = null;
	this.currentPage = this.totalPages = this.totalEntries = null;
};

/** Make the initial setup of the manager
 */
Paging.prototype.init = function (manager) {
	this.manager = manager;

	this.manager.addParameter('rows', this.pageSize);
};

Paging.prototype.setPage = function (page) {
	if (this.totalPages == null)
		return false;

	if (page === 'next' || page === ">")
		page = this.currentPage + 1;
	else if (page === 'prev' || page === "previous" || page === "<")
		page = this.currentPage - 1;
	else if (page === 'first' || page === 'start')
		page = 1;
	else if (page === 'last' || page === 'end')
		page = this.totalPages;
	else if (typeof page !== 'number')
		page = parseInt(page);

	if (page > this.totalPages || page < 1 || page === this.currentPage)
		return false;

	this.currentPage = page;
	return this.manager.addParameter('start', (page - 1) * this.pageSize, this.domain);
};

/** Sets or gets the current page
 */
Paging.prototype.page = function (p) {
	if (p !== undefined)
		this.setPage(p);

	return this.currentPage;
};

/**
 * @returns {Number} The page number of the previous page or null if no previous page.
 */
Paging.prototype.previousPage = function () {
	return this.currentPage > 1 ? (this.currentPage - 1) : null;
};

/**
 * @returns {Number} The page number of the next page or null if no next page.
 */
Paging.prototype.nextPage = function () {
	return this.currentPage < this.totalPages ? (this.currentPage + 1) : null;
};

/** We need to set all our internals.
 * NOTE: Don't forget to manually call this activity on the skill
 * using {@code}a$.pass(this, <inheriting skill>, 'afterResponse');{@code}
 */

Paging.prototype.afterResponse = function (data, jqXHR, ajaxOpts) {
	var rawResponse = jqXHR.responseJSON,
		offset = parseInt(rawResponse.responseHeader && rawResponse.responseHeader.params && rawResponse.responseHeader.params.start || this.manager.getParameter('start').value || 0);

	this.pageSize = parseInt(rawResponse.responseHeader && rawResponse.responseHeader.params && rawResponse.responseHeader.params.rows || this.manager.getParameter('rows').value || this.pageSize);

	this.totalEntries = parseInt(rawResponse.response.numFound);
	this.currentPage = Math.floor(offset / this.pageSize) + 1;
	this.totalPages = Math.ceil(this.totalEntries / this.pageSize);
};

/**
 * @param {Number|String} page A page number or text like "next", "prev", "start", "end".
 * @returns {Function} The click handler for the page link.
 */
Paging.prototype.clickHandler = function (page) {
	var self = this;
	return function () {
		if (self.setPage(page))
			self.manager.doRequest();

		return false;
	}
};

export default Paging;