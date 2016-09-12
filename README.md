# SolrJs2
A JavaScript client library for managing Solr requests


## TODO

- Make the QueryingJSON work with just passing the whole `parameterStore`. Additionally:
  - Calling the `a$.path` on each composite parameter, so it can build it's path along the way.
- Make the QueryingCombined utilize both by:
  - Having a mask which parameters go which way:
  - Prepare a filtered version with only JSON parameter's, fake the `this.parameterStore` and call `QueryingJSON.prepareQuery()`.
  - Then fake the `this.parameterStore` with the remaining parameters and call `QueryingURL.prepareQuery()`.
  - Merge the two outputs and give it as it's own output.

