/**
 * @author Chad Cumba
 */
function getQueryParams(qs) {
    qs = qs.split("+").join(" ");
    var params = {};
    var tokens;

	qs = qs.slice(1);
	queryset = qs.split('&');
	
	for(var i = 0; i < queryset.length; i++){
		tokens = queryset[i].split('=');
		params[decodeURIComponent(tokens[0])] = 
			decodeURIComponent(tokens[1]);
	}
	
	return params;
	
}