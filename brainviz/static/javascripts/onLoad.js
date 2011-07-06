/*
 * @TODO as this application has grown, the onload function has turned into a 
 * defacto constructor for the viewer singleton. We need to refactor this into
 * a constructor for the singleton instead of this bit of a mess
 * 
 * This is the only function in the app that has knowledge of the DOM. 
 */
function loadBrainvizWithSource(source){
	
	/* global viewer: false, image_id_to_load: false, Math: false,
	 * loadJsonDataFromLocation: false, brainData: false, $: true
	 */ 
	
	var store = null;
	var retrieve = null;
	
	if(document.createElement('canvas').getContext == undefined){
 		alert('Your browser does not support the HTML5 <canvas> element.'+
 		' This application will not work on your browser. Please use IE9, '+
 		'Firefox 3.0+, Safari 3.0+, Chrome 3.0+, or Opera 10.0+');
 		return;
 	}
 	
 	if(document.createElement('canvas').toDataURL != undefined &&
 		Modernizr.localstorage){
 		//if we can write out images as a data url and have access to
 		//window.localStorage, then slice caching is possible
 		
		store = function(key,value){
			try{
				window.localStorage[key] = value;
				return key;
			}catch(error){
				//we'll try to clear the storage if an error occurs
				//if that doesn't work we'll just let the exception bubble up
				//because something is seriously wrong.
				window.localStorage.clear();
				viewer.publishers.localStorageCleared.deliver();
				window.localStorage[key] = value;
				return key;
			}
		};
		retrieve = function(key){
			return window.localStorage[key];
		};
 	}
 	

	
	 
	
	//show the loading image twirling thing
	$('#loading-image').removeClass('hidden').attr('style', 
		'position:relative;top:270px;');
	
	var imageUrl = '/image/getimage';
	
	/*
	 * image_id_to_load is inserted (optionally) by the canvas.html template
	 * file. Naming convention on variables inserted by django is 
	 * verbose_with_underscores so that they stand out against regular variables
	 */
	if(image_id_to_load != undefined){
		if(image_id_to_load != null){
			imageUrl = imageUrl + "/" + image_id_to_load;
		}
	}
	
	if(source){
		imageUrl = source;
	}
	

	var canvasObjects = {};
	var textObjects = {};
	var backgrounds = {};
	var thresholds = {};
	
	
	//load the drawing canvases into the viewer
	canvasObjects.coronal = $('canvas#coronal').first()[0]
	canvasObjects.sagittal = $('canvas#sagittal').first()[0]
	canvasObjects.axial = $('canvas#axial').first()[0]
	
	//load the text output objects into the viewer
	textObjects.coordinates = $('#coords > p').first()[0];
	textObjects.voxel = $('#voxel-data > p').first()[0];
	textObjects.url = $('#permanent-url > a').first()[0];
	textObjects.threshold = $('#threshold-value > p').first()[0];
	
	
	
	var backgroundFillCallback = function(pixel){
		
		var offset = Math.abs(viewer.brainImage.getMin());
		
						
		var shade = 255 * ( (pixel + offset) / 
			(viewer.brainImage.getMax() + offset));
		
		shade = Math.floor(shade);
			
		return "rgb(255,"+shade+",0)";
	}

	
	/*
	 * harvest the backgrounds from the DOM
	 * we're throwing in some null padding here where the png would have been a
	 * solid color as the renderer's default is to just render black if there
	 * is a null background. This saves us from loading a png, and painting it.
	 */
	backgrounds.coronal = $('#coronal-backgrounds > img');
	backgrounds.coronal.splice(0,0, null,null,null,null,null);
	backgrounds.coronal.splice(backgrounds.coronal.length,0,null,null,null,null,null);
	backgrounds.sagittal = $('#sagittal-backgrounds > img');
	backgrounds.sagittal.splice(0,0,null, null, null, null);
	backgrounds.sagittal.splice(backgrounds.sagittal.length,0,null, null, null,
		null, null, null);
	backgrounds.axial = $('#axial-backgrounds > img');
	backgrounds.axial.splice(0,0,null, null, null, null, null, null);
	
	
	

	//load the get params (if any) from the url
	var $_GET = getQueryParams(document.location.search);
	
	/*
	 * these should be broken up to set the get data individually
	 */
	if($_GET['axis'] == undefined || $_GET['slice'] == undefined ||
		$_GET['clickX'] == undefined || $_GET['clickY'] == undefined ||
		$_GET['threshold'] == undefined){
		
		$_GET['axis'] = 'coronal';
		$_GET['slice'] = 30;
		$_GET['clickX'] = 120;
		$_GET['clickY'] = 144;
		$_GET['threshold'] = null;
	}
	
	thresholds.slider = $('#slider').first()[0];
	thresholds.value = $_GET['threshold'];
	thresholds.orientation = "vertical";
	
	//the viewer constructor
	viewer.init(imageUrl, canvasObjects, textObjects, thresholds,
		backgroundFillCallback,	backgrounds, store, retrieve);

	/*
	 * if there was a location in the URL, then the easiest way to render it
	 * is to artificially "click" on that spot on the canvas for the user. This
	 * is because there are many events that are triggered in response to a 
	 * click, and this way we don't have to trigger all those events individually
	 * Here we're just creating a click event and immediately triggering it on
	 * the corresponding canvas.
	 */		
	var clickEvent = $.Event('click');
	clickEvent.relativeX = parseInt($_GET['clickX']);
	clickEvent.relativeY = parseInt($_GET['clickY']);

	switch($_GET['axis']){
		case "coronal":
			/*
			 * it is necessary to render the canvas to be clicked ahead of the  
			 * click trigger, even though it will be re-rendered. This is to 
			 * prime the renderer.getLast style functions as they are in heavy 
			 * use inside the viewer.
			 */
			viewer.renderers.coronalRenderer.render(parseInt($_GET['slice']));
			viewer.renderers.coronalCrosshairs.render(
				clickEvent.relativeX, clickEvent.relativeY);
				
			$(viewer.canvases.coronalCanvas).trigger(clickEvent);
			break;
		case "sagittal":
			viewer.renderers.sagittalRenderer.render(parseInt($_GET['slice']));
			viewer.renderers.sagittalCrosshairs.render(
				clickEvent.relativeX,clickEvent.relativeY);
				
			$(viewer.canvases.sagittalCanvas).trigger(clickEvent);
			
			break;
		case "axial":
			viewer.renderers.axialRenderer.render(parseInt($_GET['slice']));
			viewer.renderers.axialCrosshairs.render(
				clickEvent.relativeX,clickEvent.relativeY);
				
			$(viewer.canvases.axialCanvas).trigger(clickEvent);
			break;
		default:
			break;
	}
	/*
	 * same deal as above, but we don't need to trigger a click event for the 
	 * threshold as there is only 1 callback to fire for the threshold changes
	 */		
	if($_GET['threshold'] == null){
		viewer.publishers.onThresholdChange.deliver(viewer.brainImage.getMin());
	}else{
		viewer.publishers.onThresholdChange.deliver($_GET['threshold']);
	}
	
	//hide the spinny loader gif
	$('#loading-image').hide();

};
