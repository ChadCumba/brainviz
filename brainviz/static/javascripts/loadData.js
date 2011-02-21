/*
 * This is a blocking function.
 * Loads data from url
 * @param dataLocation - string identifying a url to load data from
 */
function loadJsonDataFromLocation(dataLocation){
	return $.ajax({
            async: false,
            global: false,
            url: dataLocation,
            cache: false,
            dataType: "json"
        });
}
