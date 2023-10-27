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

export var CurrentSearchTerm = '';
export const ResultDisplayLength = 200;
export const TitleDisplayLength = 100;

const config = {
  searchQuery: {
    facets: buildFacetConfigFromConfig(),
    ...buildSearchOptionsFromConfig()
  },
  onSearch:
    (requestState, queryConfig, next) => {

      const updatedState = beforeSearch(requestState);
      CurrentSearchTerm = requestState.searchTerm;
      return next(updatedState, queryConfig);
    },
  autocompleteQuery: buildAutocompleteQueryConfig(),
  apiConnector: connector,
  alwaysSearchOnInitialLoad: false
};

// upon first search, set the id on the collapsible area. This is a workaround 
// because we don't have access to this class in the ElasticcSearch UI component
function beforeSearch(requestState) {

  const bodyarea = document.getElementsByClassName('sui-layout-body');

  if (bodyarea && bodyarea[0] && !bodyarea[0].id) {

    bodyarea[0].setAttribute('id', 'sui-layout-body-id');
  }
  return requestState;
}

export default function App() {

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
                        <>
                          <Sorting
                            label={"Sort by"}
                            sortOptions={buildSortOptionsFromConfig()}
                          />
                          <span className="sui-facet-legend sui-facet-access">SOURCE</span>
                        </>
                      )
                      }
                      {getFacetFields().map(field => (
                        <Facet key={field} field={field}
                          label="Source"
                          show={100}
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

  const doCollapseToggle = (isHidden) => {

    setIsHidden(!isHidden);

    const bdiv = document.getElementById('sui-layout-body-id');
    if (bdiv) {
      bdiv.classList.add(isHidden ? 'sui-collapse-show' : 'sui-collapse-hide');
      bdiv.classList.remove(isHidden ? 'sui-collapse-hide' : 'sui-collapse-show');
    }
  }

  return (
    <div className="d-flex flex mt-5">
      <button
        className="btn btn-outline-secondary btn-md-teal ms-auto"
        type="button"
        onClick={() => doCollapseToggle(isHidden)}>
        {isHidden ? "Show Results" : "Hide Results"}
      </button>
    </div>)
}
