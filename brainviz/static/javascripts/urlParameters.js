/**
 * @author Chad Cumba
 */
function getQueryParams(qs) {
    qs = qs.split("+").join(" ");
    var params = {};
    var tokens;

    while (tokens = /[?&]?([^=]+)=([^&]*)/g.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}