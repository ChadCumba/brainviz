/**
 * @author Chad Cumba
 * @param qs - the url query string starting at ?
 */
function getQueryParams(qs) {
    qs = qs.split("+").join(" ");
    var params = {};
    var tokens;

	qs = qs.slice(1);
	queryset = qs.split('&');
	
	/*
	 * we can't use a regex here due to the way 
	 * chrome and safari implement regex. in those browsers 
	 * this loop will never terminate if we use a regex
	 */
	for(var i = 0; i < queryset.length; i++){
		tokens = queryset[i].split('=');
		params[decodeURIComponent(tokens[0])] = 
			decodeURIComponent(tokens[1]);
	}
	
	return params;
	
}