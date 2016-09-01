(function () {
  // Define this as a main object to put everything in
  Solr = { version: "{{VERSION}}" };

  // Now import all the actual skills ...
  // ATTENTION: Kepp them in the beginning of the line - this is how smash expects them.
  
import "Management";
import "Configuring";
import "QueryingURL";
import "QueryingJson";
import "QueryingFlexible";
import "Persistency";
import "Paging";
import "Texting";
import "Faceting";

  /** ... and finish with some module / export definition for according platforms
    */
  if ( typeof module === "object" && module && typeof module.exports === "object" )
  	module.exports = Solr;
  else {
    this.Solr = Solr;
    if ( typeof define === "function" && define.amd )
      define(Solr);
  }
})();
