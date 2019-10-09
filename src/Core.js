/** SolrJsX library - a neXt Solr queries JavaScript library.
 * The Core, integrating for all skills
 *
 * Author: Ivan Georgiev
 * Copyright © 2016, IDEAConsult Ltd. All rights reserved.
 */

 var bracketsRegExp = /^\s*\(\s*|\s*\)\s*$/g,
    statsRegExp = /^([^()]+)\(([^)]+)\)$/g;

export default {
    version: "{{VERSION}}",

    /** This is directly copied from AjaxSolr.
     */

    escapeValue(value) {
        // If the field value has a space, colon, quotation mark or forward slash
        // in it, wrap it in quotes, unless it is a range query or it is already
        // wrapped in quotes.
        if (typeof value !== 'string')
            value = value.toString();

        if (value.match(/[ :\/"]/) && !value.match(/[\[\{]\S+ TO \S+[\]\}]/) && !value.match(/^["\(].*["\)]$/)) {
            return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
        }
        return value;
    },

    escapeField(field) {
        return field.replace(/\s/g, "\\$&");
    },

    /**
     * Parameter specification: https://cwiki.apache.org/confluence/display/solr/Local+Parameters+in+Queries
     */
    parseParameter (str) {
        var param = {},
            parse = str.match(/^([^=]+)=(?:\{!([^\}]*)\})?(.*)$/);
        if (parse) {

            if (parse[2] != null) {
                var matches;
                while (matches = /([^\s=]+)=?(\S*)?/g.exec(parse[2])) {
                    if (param.domain === undefined)
                        param.domain = {};
                    if (matches[2] == null)
                        param.domain['type'] = matches[1];
                    else
                        param.domain[matches[1]] = matches[2];
                    parse[2] = parse[2].replace(matches[0], ''); // Safari's exec seems not to do this on its own
                }
            }

            param.name = parse[1];
            var arr = parse[3].split(",");
            param.value = arr.length > 1 ? arr : parse[3];
        }

        return param;
    },


    /**
     * Forms the string for filtering of the current facet value
     */
    facetValue(value) {
        if (!Array.isArray(value))
            return Solr.escapeValue(value);
        else if (value.length == 1)
            return Solr.escapeValue(value[0]);
        else
            return "(" + value.map(function (v) {
                return Solr.escapeValue(v);
            }).join(" ") + ")";
    },

    /**
     * Parses a facet filter from a parameter.
     *
     * @returns {Object} { field: {String}, value: {Combined}, exclude: {Boolean} }.
     */
    parseFacet(value) {
        var old = value.length,
            sarr, brackets;

        value = value.replace(bracketsRegExp, "");
        brackets = old > value.length;

        sarr = value.replace(/\\"/g, "%0022").match(/[^\s:\/"]+|"[^"]+"/g);
        if (!brackets && sarr.length > 1) // we can't have multi-values without a brackets here.
            return null;

        for (var i = 0, sl = sarr.length; i < sl; ++i)
            sarr[i] = sarr[i].replace(/^"|"$/g, "").replace("%0022", '"');

        return sl > 1 ? sarr : sarr[0];
    },

    /** Build and add stats fields for non-Json scenario
     * TODO: This has never been tested!
     */
    facetStats(manager, tag, statistics) {
        manager.addParameter('stats', true);
        var statLocs = {};

        // Scan to build the local (domain) parts for each stat    
        _.each(statistics, function (stats, key) {
            var parts = stats.match(statsRegExp);

            if (!parts)
                return;

            var field = parts[2],
                func = parts[1],
                loc = statLocs[field];

            if (loc === undefined) {
                statLocs[field] = loc = {};
                loc.tag = tag;
            }

            loc[func] = true;
            loc.key = key; // Attention - this overrides.
        });

        // Finally add proper parameters
        _.each(statLocs, function (s, f) {
            manager.addParameter('stats.field', f, s);
        });
    },


    stringifyDomain(param) {
        var prefix = [];

        _.each(param.domain, function (l, k) {
            prefix.push((k !== 'type' ? k + '=' : '') + l);
        });
        return prefix.length > 0 ? "{!" + prefix.join(" ") + "}" : "";
    },

    stringifyValue(param) {
        var value = param.value || "";

        if (Array.isArray(value))
            return value.join(",");
        else if (typeof value !== 'object')
            return value.toString();
        else {
            var str = [];
            _.each(value, function (v, k) {
                str.push(Solr.escapeField(k) + ":" + Solr.escapeValue(v));
            });
            return str.join(" ");
        }
    },

    stringifyParameter(param) {
        var prefix = Solr.stringifyDomain(param);

        // For dismax request handlers, if the q parameter has local params, the
        // q parameter must be set to a non-empty value.
        return param.value || prefix ? param.name + "=" + encodeURIComponent(prefix + Solr.stringifyValue(param)) : null;
    },

    buildUrl(serverUrl, servlet, paramArr) {
        var urlPrefix = (serverUrl || '') + (servlet || ''),
            urlParams = paramArr.join("&");

        return urlPrefix + (urlPrefix.indexOf('?') > 0 ? "&" : "?") + urlParams;
    },
};
