/** SolrJsX library - a neXt Solr queries JavaScript library.
  * The Core, integrating for all skills
  *
  * Author: Ivan Georgiev
  * Copyright © 2016, IDEAConsult Ltd. All rights reserved.
  */
  

import Solr from './Core';

import _Config from "./Configuring";
import _Compat from "./Compatibility";
import _QUrl from "./QueryingURL";
import _QJson from "./QueryingJson";
import _Persist from "./Persisting";
import _Paging from "./Paging";
import _Event from "./Eventing";
import _Pattern from "./Patterning";
import _Text from "./Texting";
import _Facet from "./Faceting";
import _Range from "./Ranging";
import _Pivot from "./Pivoting";
import _List from "./Listing";

import _RawAdaptor from "./adapters/RawAdapter";
import _NestedAdaptor from "./adapters/NestedAdapter";

Solr.Configuring = _Config;
Solr.Compatibility = _Compat;
Solr.QueryingURL = _QUrl;
Solr.QueryingJson = _QJson;
Solr.Persisting = _Persist;
Solr.Paging = _Paging;
Solr.Eventing = _Event;
Solr.Patterning = _Pattern;
Solr.Texting = _Text;
Solr.Faceting = _Facet;
Solr.Ranging = _Range;
Solr.Pivoting = _Pivot;
Solr.Listing = _List;

Solr.RawAdapter = _RawAdaptor;
Solr.NestedAdapter = _NestedAdaptor;

export default Solr;
