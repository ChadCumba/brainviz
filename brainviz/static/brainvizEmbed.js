

/*
 * this is more or less torn straight out of jQuery with a few modifications
 */
function loadScript(url, callback){
	
	var head = document.getElementsByTagName("head")[0];
	var script = document.createElement("script");
	
	
	script.src = url;
	
	{
		var done = false;
		
		script.onload = script.onreadystatechange = function() {
			if( !done && (!this.readyState || 
				this.readyState == "loaded" || this.readyState == "complete")){
					
					done = true;
					if(callback){
						callback();
						
						//fixes memory leak in IE
						script.onload = script.onreadystatechange = null;
					}
				};
		}
	}
	
	head.appendChild(script);
	
	return undefined;

};



/*
 * load the minified viewer script, and send in another call to load the 
 * data script as the callback after the viewer script loads.
 */
window.onload = function() {
	
	window.Modernizr = {};
	
	var imageId = 1;
	
	if(window.image_id_to_load !== undefined){
		imageId = window.image_id_to_load;
	}
	
	loadScript('http://localhost:8000/static/javascripts/tmp-min.js',
		function(){
			window.Modernizr.localstorage = false;
			loadScript('http://localhost:8000/image/getimage/'+imageId+'.js');
		}
	);
};