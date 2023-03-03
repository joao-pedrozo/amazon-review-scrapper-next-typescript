// take current url and add sort param
const sortUrl = (url) => {
    var sortParam = encodeURI('&sort=review-count-rank');
    var hashStart = (url.indexOf('#') === -1) ? url.length : url.indexOf('#');
    var querySymbol = (url.indexOf('?') === -1) ? '?' : '&';
    return url.substring(0, hashStart) + querySymbol + sortParam + url.substring(hashStart);
};