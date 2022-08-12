import React from "react";
import { useState } from 'react';

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

import { Collapse } from 'bootstrap/js/dist/collapse';

import 'bootstrap/dist/css/bootstrap.min.css';
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import './suicustom.css';

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

// Upon search, set up the sui-layout-div with the classes and id
// in order to make it the collapse target

function beforeSearch(requestState) {
  
  const bodyarea = document.getElementsByClassName('sui-layout-body');

  if (bodyarea && bodyarea[0] && !bodyarea[0].id) {

    bodyarea[0].classList.add('collapse', 'show');
    bodyarea[0].setAttribute('id', 'collapseTarget');
  }  
  return requestState;
}

const CustomResultView = ({ result, onClickLink }) => (
  <li className="sui-result">
    <div className="sui-result__header">

      {/* Maintain onClickLink to correct track click throughs for analytics*/}
      <a className="sui-result__title sui-result__title-link"
        onClick={onClickLink}
        href={result.url.raw}
        target="_blank" rel="noopener noreferrer"
        dangerouslySetInnerHTML={{ __html: `${sanitizeStr(result.title.snippet)}` }}>
      </a>

    </div>
    <div className="sui-result__body sui-result__details ">
      <SanitizeHTML html={result.body_content.snippet} />
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

const CollapseBut = () => {

  const [isHidden, setIsHidden] = useState(false);

  const changeText = () => setIsHidden(!isHidden);

  return (
    <div class="d-flex mt-3">
      <button className="btn btn-outline-secondary ms-auto" type="button"
      data-bs-toggle="collapse" data-bs-target="#collapseTarget"
      aria-expanded="true" aria-controls="collapseTarget"
      onClick={() => changeText()}>
      {isHidden ? "Show Results" : "Hide Results"}
      </button>
    </div>
  )
}
