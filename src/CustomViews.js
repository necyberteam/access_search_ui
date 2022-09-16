
import React from "react";
import { getFilterValueDisplay } from "@elastic/react-search-ui-views/lib/esm/view-helpers";

import { SourceSpecs } from "./SearchUrlNames.js";
import { SanitizeHTML, sanitizeStr } from "./Sanitize";
import { CurrentSearchTerm, ResultDisplayLength, TitleDisplayLength } from "./App.js";

// Display one result. 
// webcrawl (app search) and confluence connector (worksplace search) results need to be handled differently
// as the fields are differnt, plus confluence does not make emphasized snippets. 

function CustomResultView({ result, onClickLink }) {

  let bodySnip = '';
  let titleSnip = '';
  try {
    const iTypeConfluence = 2;
    const iTypeCrawl = 1;
    let indexType = iTypeCrawl;

    if (result.source && result.source.raw === 'confluence_cloud') {
      indexType = iTypeConfluence;

      // in case unwanted spaces come through the connecter,
      // only allow the space (project) that is the documentation space  

      if (result.project == null || result.project.raw !== 'ACCESSdocumentation') {
        return ('');
      }
    }

    if (indexType === iTypeCrawl) {
      if (result.title != null) {
        titleSnip = (result.title.snippet != null) ? result.title.snippet : result.title;
      }
      if (result.body_content != null) {
        bodySnip = (result.body_content.snippet != null) ? result.body_content.snippet : result.body_content;
      }
    }
    else {
      // iTypeConfluence
      if (result.title != null && result.title.raw != null) titleSnip = makeSnippet(result.title.raw, TitleDisplayLength);
      if (result.body != null && result.body.raw != null) bodySnip = makeSnippet(result.body.raw, ResultDisplayLength);
    }

  } catch (error) {
    console.log(`!!! Error in CustomResultView: ${error}`);
    console.log(result);
  }

  return (
    <li className="sui-result">
      <div className="sui-result__header">

        {/* Maintain onClickLink to correct track click throughs for analytics*/}
        <a className="sui-result__title sui-result__title-link"
          onClick={onClickLink}
          href={result.url.raw}
          target="_blank" rel="noopener noreferrer"
          dangerouslySetInnerHTML={{ __html: `${sanitizeStr(titleSnip)}` }}>
        </a>

      </div>
      <div className="sui-result__body sui-result__details ">
        <SanitizeHTML html={bodySnip} />
      </div>
    </li>
  );

}

// we need this to fix up the Workplace Search onfluence connector results to act like the results
// returnedfrom App Search web crawl.
// Insert emphasis markup around the search term and trim results around the term to size
// if exact search term not found, just trim
function makeSnippet(text, length) {

  let snippet = '';
  try {
    let rterm = '<em>' + CurrentSearchTerm + '</em>';
    let searchRegExp = new RegExp(CurrentSearchTerm, 'ig');
    const emphasized = text.replace(searchRegExp, rterm);
    
    let pos = emphasized.indexOf(rterm);    
    if (pos === -1) pos = 0;

    // first chop off portion up to found word, then cut at space boundry
    snippet = emphasized.substring(pos, emphasized.length);    
    snippet = truncateAtSpace(snippet, length)    
  }
  catch (error) {
    console.log(`!!! Error in makeSnippet: ${error} ` + text );    
  }
  return snippet;
}

function truncateAtSpace (str, len)  {
  if (str.length < len)  return str;
  if (str.lastIndexOf(" ") === -1) return str.substring(0,len);  
  return str.substring( 0, str.substring(0, len).lastIndexOf(" "));
}

// This is a variation on  MultiCheckBoxFacetView
// Necessary so that we can display our own mapped labels for the options, 
// and sort as we like.

function CustomFacetView({  
  label,
  onMoreClick,
  onRemove,
  onSelect,
  options,
  showMore,
  showSearch,
  onSearch,
  searchPlaceholder
}) {

  var ordOptions = orderOptions(options);

  return (

    <div className="sui-facet-access">        
      
      {showSearch && (
        <div className="sui-facet-search">
          <input
            className="sui-facet-search__text-input"
            type="search"
            placeholder={searchPlaceholder || "Search"}
            onChange={(e) => {
              onSearch(e.target.value);
            }}
          />
        </div>
      )}

      <div className="sui-multi-checkbox-facet">
        {ordOptions.length < 1 && <div>No matching options</div>}
        {ordOptions.map((option) => {
          const checked = option.selected;
          const value = option.value;
          return (
            <label
              key={`${getFilterValueDisplay(option.value)}`}
              htmlFor={`example_facet_${label}${getFilterValueDisplay(
                option.value
              )}`}
              className="sui-multi-checkbox-facet__option-label"
            >
              <div className="sui-multi-checkbox-facet__option-input-wrapper">
                <input
                  data-transaction-name={`facet - ${label}`}
                  id={`example_facet_${label}${getFilterValueDisplay(
                    option.value
                  )}`}
                  type="checkbox"
                  className="sui-multi-checkbox-facet__checkbox"
                  checked={checked}
                  onChange={() => (checked ? onRemove(value) : onSelect(value))}
                />
                <span className="sui-multi-checkbox-facet__input-text">
                  {getSearchOptionDisplay(option)}
                </span>
              </div>
              <span className="sui-multi-checkbox-facet__option-count">
                {option.count.toLocaleString("en")}
              </span>
            </label>
          );
        })}
      </div>

      {showMore && (
        <button
          type="button"
          className="sui-facet-view-more"
          onClick={onMoreClick}
          aria-label="Show more options"
        >
          + More
        </button>
      )}
    </div>
  );
}

// merge the source options list returned by Search UI with our custom Source Specs
// to get the display texts and display order. order=99 (signifying end of list) if display order not found.

function orderOptions(resultOptions) {

  let res = [];

  res = resultOptions.map(obj => {

    const index = SourceSpecs.findIndex(el => el["url"] === obj["value"]);

    const specs = index !== -1 ? SourceSpecs[index] : { order: 99 };

    return {
      ...obj,
      specs
    };
  });

  res.sort((a, b) => a.specs.order - b.specs.order);
  return res;
}
function getSearchOptionDisplay(option) {

  if (option === undefined || option === null) return "";

  return (option.specs.display === undefined || option.specs.display === ""
    ? String(option.value) : option.specs.display);
}

export { CustomResultView, CustomFacetView };