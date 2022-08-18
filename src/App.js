import React from "react";
import { useState } from 'react';

import "@elastic/react-search-ui-views/lib/styles/styles.css";
import './suicustom.css';

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
// eslint-disable-next-line no-unused-vars
import { Collapse } from 'bootstrap/js/dist/collapse';

import {
  buildAutocompleteQueryConfig,
  buildFacetConfigFromConfig,
  buildSearchOptionsFromConfig,
  buildSortOptionsFromConfig,
  getConfig,
  getFacetFields
} from "./config/config-helper";

import { CustomResultView, CustomFacetView } from "./CustomViews.js";

const { hostIdentifier, searchKey, endpointBase, engineName } = getConfig();
const connector = new AppSearchAPIConnector({
  searchKey,
  engineName,
  hostIdentifier,
  endpointBase
});

const config = {
  searchQuery: {
    facets: buildFacetConfigFromConfig(),
    ...buildSearchOptionsFromConfig()
  },
  onSearch:
    (requestState, queryConfig, next) => {
      const updatedState = beforeSearch(requestState);
      return next(updatedState, queryConfig);
    },
  autocompleteQuery: buildAutocompleteQueryConfig(),
  apiConnector: connector,
  alwaysSearchOnInitialLoad: false
};

// upon first search, make a collapse target div around the existing div with the class sui-layout-body
// (setting the attributes directly on the sui-layout-body div causes issues when put into the drupal site)
function beforeSearch ( requestState) {

  const bodyarea = document.getElementsByClassName('sui-layout-body');      
  
  if (bodyarea && bodyarea[0] && !bodyarea[0].id) {
    console.log("setting up collpase container");

    bodyarea[0].setAttribute('id','sui-layout-body-id');
    
    const layoutDiv = document.getElementsByClassName('sui-layout');      

    if (layoutDiv && layoutDiv[0]) {

      if (!document.getElementById('sui-collapse-target')) {

        const wrapperDiv = document.createElement("div");
        wrapperDiv.setAttribute('id', 'sui-collapse-target');
        wrapperDiv.classList.add('collapse', 'show');
      
        layoutDiv[0].insertBefore(wrapperDiv, bodyarea[0]);
        wrapperDiv.appendChild(bodyarea[0]);
      }
    }
  } 
  return requestState;
}

export default function App() {

  if (process.env.NODE_ENV === "development") {
    console.log("including bootstrap: " + process.env.NODE_ENV);
    require('bootstrap/dist/css/bootstrap.min.css');
  } else {
    console.log("not incl bootstrap: " + process.env.NODE_ENV);
  }

  return (
    <SearchProvider config={config}>
      <WithSearch mapContextToProps={({ wasSearched }) => ({ wasSearched })}>
        {({ wasSearched }) => {
          return (
            <div className="App">
              <ErrorBoundary>
                <Layout
                  header={
                    <>
                      <SearchBox autocompleteSuggestions={true} />
                      {wasSearched && <CollapseBut></CollapseBut>}
                    </>
                  }

                  sideContent={
                    <div>
                      {wasSearched && (
                        <Sorting
                          label={"Sort by"}
                          sortOptions={buildSortOptionsFromConfig()}
                        />
                      )}
                      {getFacetFields().map(field => (
                        <Facet key={field} field={field}
                          label="Source"
                          view={CustomFacetView}
                        />
                      ))}
                    </div>
                  }

                  bodyContent={
                    <Results
                      resultView={CustomResultView}
                      titleField={getConfig().titleField}
                      urlField={getConfig().urlField}
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

const CollapseBut = () => {

  const [isHidden, setIsHidden] = useState(false);

  const changeText = () => setIsHidden(!isHidden);

  return (
    <div className="d-flex mt-3">
      <button 
        className="btn btn-outline-secondary ms-auto" 
        type="button"
        data-bs-toggle="collapse" 
        data-bs-target="#sui-collapse-target"        
        aria-controls="sui-collapse-target"
        aria-expanded={isHidden ? "false" : "true"}
        onClick={() => changeText()}>
        {isHidden ? "Show Results" : "Hide Results"}
      </button>
    </div>
  )
}