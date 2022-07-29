/* Usage:
 
<SanitizeHTML html="<img src=x onerror=alert('img') />" />

derived from https://stackoverflow.com/questions/38663751/how-to-safely-render-html-in-react
*/

import sanitizeHtml from 'sanitize-html';

const defaultOptions = {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
        'a': ['href']
    }
};

// return a string
export function sanitizeStr(dirty) {

    var s = sanitizeHtml(dirty, defaultOptions);
    return (s);
}

export const sanitize = (dirty) => ({

    __html: sanitizeHtml(
        dirty,
        defaultOptions)
}
);

export const SanitizeHTML = ({ html }) => (
    <div dangerouslySetInnerHTML={sanitize(html)} />
);

