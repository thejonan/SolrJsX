import pkg from './package.json'

export default {
	input: pkg.module,
	output: {
		file: pkg.main,
		format: 'umd',
		interop: false,
		name: pkg.name,
		banner: '/** SolrJsX library - a neXt, lightweight Solr queries JavaScript library. Copyright © 2016-2019, IDEAConsult Ltd. All rights reserved. @license MIT.*/',
		globals: { 
			"lodash" : "_",
			"as-sys": "asSys",
			"solr-jsx": "Solr"
		}
	},
	external: [ "lodash", "as-sys" ]
};
