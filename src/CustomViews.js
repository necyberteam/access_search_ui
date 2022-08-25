
import React from "react";
import { appendClassName, getFilterValueDisplay } from "@elastic/react-search-ui-views/lib/esm/view-helpers";

import { SearchUrlNames } from "./SearchUrlNames.js";
import { SanitizeHTML, sanitizeStr } from "./Sanitize";

function CustomResultView({ result, onClickLink }) {

  let bodySnip ='';
  let titleSnip ='';
  try {  
    titleSnip = result.title && result.title.snippet;
    bodySnip = result.body_content && result.body_content.snippet;    

  } catch (error) {     
    console.log(`Error in CustomResultView: ${error}`)
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

// This is largely a copy of MultiCheckBoxFacetView
// Necessary so that we can display our own mapped labels for the options.
// For us, this is display name mapped from the URL

function CustomFacetView({
  className,
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

  return (
    <fieldset className={appendClassName("sui-facet", className)}>
      <legend className="sui-facet__title">{label}</legend>

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
        {options.length < 1 && <div>No matching options</div>}
        {options.map((option) => {
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
                  {getSearchOptionDisplay(option.value)}
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
    </fieldset>
  );
}

function getSearchOptionDisplay(option) {

  if (option === undefined || option === null) return "";
  var displayName = SearchUrlNames[option];

  return (displayName === undefined ? String(option) : displayName);
}

export { CustomResultView, CustomFacetView };