/*
 * This is a blocking function.
 * Loads data from url
 * @param dataLocation - string identifying a url to load data from
 */
function loadJsonDataFromLocation(dataLocation){
	var jsonData = $.ajax({
            async: false,
            global: false,
            url: dataLocation,
            cache: true,
            dataType: "json"
        });
    
    return $.parseJSON(jsonData.responseText);
}
