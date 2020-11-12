/** SolrJsX library - a neXt Solr queries JavaScript library.
 * Persistentcy of configured parameters in URL
 *
 * Author: Ivan Georgiev
 * Copyright © 2016, IDEAConsult Ltd. All rights reserved.
 */

Solr.UrlPersistency = function (settings) {
  a$.extend(true, this, a$.common(settings, this));
  this.id = settings.id;
};

Solr.UrlPersistency.prototype = {
	urlParam: 'sel',
	storedParams: [], // Parameters that need to stay persistent between calls.

  /** Make the initial setup of the manager.
    */
  init: function (manager) {
    a$.pass(this, Solr.UrlPersistency, "init", manager);
    this.manager = manager;
  },

  /**
   * Restore into the manager the given state, i.e. - set of srotred parameters.
   * @param {state} state An array of stored Solr parameters to be restored
   * @description The array of parameters should either be raw Solr { name, value, domain? }, 
   * or it can be { id, value } pair, where `id` refers to the appropriate manger's listener.
   */
  restore: function (state) {
    if (!state)
      state = this.getUrlParam(document.location.href, this.urlParam);
    if (state)
      this.manager.importParameters(state);
  },

  /**
   * Adds a given parameter to the current url.
   * @param {string} url The url to be added the parameter to.
   * @param {string} name Name of the parameter to be added to the URL.
   * @param {string|object} value The value to be stored. If object - stringified first.
   * @returns {string} The new URL.
   */
  addUrlParam: function (url, name, value) {
    value = JSON.stringify(value);

    var a = document.createElement('a'),
      str = !!value ? name + "=" + encodeURIComponent(value) : "",
      mbs, q;

    a.href = url;
    q = a.search;

    mbs = q.match(new RegExp(name + "=[\\S^&]+"))

    if (!!mbs)
      q = q.replace(mbs[0], str);
    else if (!str)
      return;
    else if (q.charAt(0) == '?')
      q = "?" + str;
    else
      q += (q.slice(-1) == "&" ? "" : "&") + str;

    a.search = q;
    return a.href;
  },

  /**
   * 
   * @param {string} url The url to get the addres from
   * @param {*} name 
   */
  getUrlParam: function (url, name) {
    var a = document.createElement('a');
    a.href = url;
    var par = (function () {
      var ret = {},
        seg = a.search.replace(/^\?/, '').split('&'),
        len = seg.length,
        i = 0,
        s, v, arr;
      for (; i < len; i++) {
        if (!seg[i]) {
          continue;
        }
        s = seg[i].split('=');
        v = (s.length > 1) ? decodeURIComponent(s[1].replace(/\+/g, " ")) : '';
        if (s[0].indexOf('[]') == s[0].length - 2) {
          arr = ret[s[0].slice(0, -2)];
          if (arr === undefined)
            ret[s[0].slice(0, -2)] = [v];
          else
            arr.push(v);
        } else
          ret[s[0]] = v;
      }
      return ret;
    })()[name];

    return par && JSON.parse(par);
  },

  pushToHistory: function (state) {
    return window.history.pushState(
      state, 
      document.title,
      this.addUrlParam(window.location.href, this.urlParam, state));
  },

  afterRequest: function () {
    this.pushToHistory(this.manager.exportParameters(this.storedParams));
  }
};