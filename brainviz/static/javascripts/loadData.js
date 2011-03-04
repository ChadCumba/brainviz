/*
 * This is a blocking function.
 * Loads data from url
 * @param dataLocation - string identifying a url to load data from
 * @TODO - change this from a blocking call to an async call
 * and execute the rest of onload from the callback
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
