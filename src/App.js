import React from "react";

import AppSearchAPIConnector from "@elastic/search-ui-app-search-connector";

import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  Sorting,
  WithSearch
} from "@elastic/react-search-ui";
import { Layout } from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

import {
  buildAutocompleteQueryConfig,
  buildFacetConfigFromConfig,
  buildSearchOptionsFromConfig,
  buildSortOptionsFromConfig,
  getConfig,
  getFacetFields
} from "./config/config-helper";

import { SanitizeHTML, sanitizeStr } from "./Sanitize";

const { hostIdentifier, searchKey, endpointBase, engineName } = getConfig();
const connector = new AppSearchAPIConnector({
  searchKey,
  engineName,
  hostIdentifier,
  endpointBase
});
//result_fields: {
 // "body_content": {
  //  snippet: {
   //   size: 200,
    //  fallback: true
   // }
  //},
  //title: {
   // snippet: {
    //  size: 10,
     // fallback: true
   // }
 // }
//},
const config = {
  searchQuery: {  
    
    facets: buildFacetConfigFromConfig(),
    ...buildSearchOptionsFromConfig()
  },
  autocompleteQuery: buildAutocompleteQueryConfig(),
  apiConnector: connector,
  alwaysSearchOnInitialLoad: false  
};

const CustomResultView = ({ result, onClickLink }) => (
  <li className="sui-result">
    <div className="sui-result__header">
      
        {/* Maintain onClickLink to correct track click throughs for analytics*/}        
        <a className="sui-result__title sui-result__title-link" 
          onClick={onClickLink} 
          href={result.url.raw} 
          target="_blank" rel="noopener noreferrer"
          dangerouslySetInnerHTML={{__html: `${sanitizeStr(result.title.snippet)}`} }>
        </a>
      
    </div>
    <div className="sui-result__body sui-result__details ">      
      <SanitizeHTML  html={result.body_content.snippet }    />
    </div>
  </li>
);

export default function App() {
  return (
    <SearchProvider config={config}>
      <WithSearch mapContextToProps={({ wasSearched }) => ({ wasSearched })}>
        {({ wasSearched }) => {
          return (
            <div className="App">
              <ErrorBoundary>
                <Layout
                  header={<SearchBox autocompleteSuggestions={true} />}
                  sideContent={
                    <div>
                      {wasSearched && (
                        <Sorting
                          label={"Sort by"}
                          sortOptions={buildSortOptionsFromConfig()}
                        />
                      )}
                      {getFacetFields().map(field => (
                        <Facet key={field} field={field} label="Source" />
                      ))}
                    </div>
                  }
                  bodyContent={
                    <Results
                      resultView={CustomResultView}   
                      titleField={getConfig().titleField}
                      urlField={getConfig().urlField}
                      //thumbnailField={getConfig().thumbnailField}
                      shouldTrackClickThrough={true}
                    />
                  }
                  bodyHeader={
                    <React.Fragment>
                      {wasSearched && <PagingInfo />}
                      {wasSearched && <ResultsPerPage />}
                    </React.Fragment>
                  }
                  bodyFooter={<Paging />}
                />
              </ErrorBoundary>
            </div>
          );
        }}
      </WithSearch>
    </SearchProvider>
  );
}
