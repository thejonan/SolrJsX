/** SolrJsX library - a neXt Solr queries JavaScript library.
  * The Core, integrating for all skills
  *
  * Author: Ivan Georgiev
  * Copyright © 2016, IDEAConsult Ltd. All rights reserved.
  */
  

(function (a$) {
  // Define this as a main object to put everything in
  Solr = { version: "{{VERSION}}" };

  // Now import all the actual skills ...
  // ATTENTION: Kepp them in the beginning of the line - this is how smash expects them.
  
import "Management";
import "Configuring";
import "Compatibility";
import "QueryingURL";
import "QueryingJson";
import "UrlPersistency";
import "Paging";
import "Requesting";
import "Spying";
import "Delaying";
import "Patterning";
import "Texting";
import "Faceting";
import "Ranging";
import "Pivoting";
import "Listing";
import "FacetSearching";

  /** ... and finish with some module / export definition for according platforms
    */
  if ( typeof module === "object" && module && typeof module.exports === "object" )
  	module.exports = Solr;
  else {
    this.Solr = Solr;
    if ( typeof define === "function" && define.amd )
      define(Solr);
  }
})(asSys);
