$(window).load(function(){
	
	/* global viewer: false, image_id_to_load: false, Math: false,
	 * loadJsonDataFromLocation: false, brainData: false
	 */ 
	
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
	
	var background = loadJsonDataFromLocation(imageUrl);
	
	for(var i = 0; i < background.data.length; i++){
		background.data[i].reverse();
		for(var j = 0; j < background.data[i].length; j++){
			background.data[i][j].reverse();
		}
	}
	
	//load the data into the viewer
	viewer.brainImage = new brainData(background.data, background.max,
										background.min);
	
	//load the drawing canvases into the viewer
	viewer.canvases.coronalCanvas = $('canvas#coronal').first()[0]
	viewer.canvases.sagittalCanvas = $('canvas#sagittal').first()[0]
	viewer.canvases.axialCanvas = $('canvas#axial').first()[0]
	
	//load the text output objects into the viewer
	viewer.textOutput.coordinateObject = $('#coords > p').first()[0];
	viewer.textOutput.voxelObject = $('#voxel-data > p').first()[0];
	viewer.textOutput.urlObject = $('#permanent-url > a').first()[0];
	
	
	var backgroundFillCallback = function(pixel){
		
		var offset = Math.abs(viewer.brainImage.getMin());
		
						
		var shade = 255 * ( (pixel + offset) / 
			(viewer.brainImage.getMax() + offset));
		
		shade = Math.floor(shade);
			
		return "rgb("+shade+","+shade+","+shade+")";
	}

	//load the renderers into the viewer
	viewer.renderers.coronalRenderer =
		new brainOrientationRenderer(
			viewer.brainImage,
			viewer.brainImage.getCoronalData, 
			viewer.canvases.coronalCanvas, 'Coronal', 4,
			backgroundFillCallback
		);
	viewer.renderers.sagittalRenderer = 		
		new brainOrientationRenderer(
			viewer.brainImage,
			viewer.brainImage.getSagittalData,
			viewer.canvases.sagittalCanvas, 'Sagittal', 4,
			backgroundFillCallback
		);
	viewer.renderers.axialRenderer =	
		new brainOrientationRenderer(
			viewer.brainImage,
			viewer.brainImage.getAxialData,
			viewer.canvases.axialCanvas, 'Axial', 4,
			backgroundFillCallback
		);
	viewer.renderers.coronalCrosshairs = 
		new crosshairsRenderer(
			viewer.canvases.coronalCanvas,
			1,
			'#FF0000' //red
		);
	viewer.renderers.sagittalCrosshairs = 
		new crosshairsRenderer(
			viewer.canvases.sagittalCanvas,
			1,
			'#FF0000' 
		);
	viewer.renderers.axialCrosshairs = 
		new crosshairsRenderer(
			viewer.canvases.axialCanvas,
			1,
			'#FF0000' 
		);
	/*
	 * harvest the backgrounds from the DOM
	 * we're throwing in some null padding here where the png would have been a
	 * solid color
	 */
	var coronal_backgrounds = $('#coronal-backgrounds > img');
	coronal_backgrounds.splice(0,0, null,null,null,null,null,null);
	coronal_backgrounds.splice(coronal_backgrounds.length,0,null,null,null,null,null);
	var sagittal_backgrounds = $('#sagittal-backgrounds > img');
	sagittal_backgrounds.splice(0,0,null, null, null, null);
	sagittal_backgrounds.splice(sagittal_backgrounds.length,0,null, null, null,
		null, null, null, null);
	var axial_backgrounds = $('#axial-backgrounds > img');
	axial_backgrounds.splice(0,0,null, null, null, null, null, null, null);
	
	viewer.renderers.coronalBackgroundRenderer = 
		new brainBackgroundImageRenderer(
			coronal_backgrounds,
			viewer.canvases.coronalCanvas,
			null,
			'#D0D0D0' //light grey
		);
		
	viewer.renderers.sagittalBackgroundRenderer = 
		new brainBackgroundImageRenderer(
			sagittal_backgrounds,
			viewer.canvases.sagittalCanvas,
			null,
			'#D0D0D0'
		);
	viewer.renderers.axialBackgroundRenderer = 
		new brainBackgroundImageRenderer(
			axial_backgrounds,
			viewer.canvases.axialCanvas,
			null,
			'#D0D0D0'
		);

	//subscribe the listeners to the event handlers
	viewer.listeners.dispatchRenderingData.subscribe(
		viewer.publishers.onSagittalChange
	);
	viewer.listeners.dispatchRenderingData.subscribe(
		viewer.publishers.onAxialChange
	);
	viewer.listeners.dispatchRenderingData.subscribe(
		viewer.publishers.onCoronalChange
	);
	viewer.listeners.updateTextDisplay.subscribe(
		viewer.publishers.onCrosshairChange
	);

	
	//sets the click handling bindings
	viewer.setEventBindings();

	//load the get params (if any) from the url
	var $_GET = getQueryParams(document.location.search);

	if($_GET['axis'] != undefined && $_GET['slice'] != undefined &&
		$_GET['clickX'] != undefined && $_GET['clickY'] != undefined){
		
		var clickEvent = $.Event('click');
		clickEvent.relativeX = parseInt($_GET['clickX']);
		clickEvent.relativeY = parseInt($_GET['clickY']);
	
		switch($_GET['axis']){
			case "coronal":
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
			
			
	}else{
		//render some default slices
		viewer.renderers.coronalRenderer.render(30);
		viewer.renderers.sagittalRenderer.render(30);
		viewer.renderers.axialRenderer.render(30);
		//render the default crosshair positions
		viewer.renderers.coronalCrosshairs.render(
			Math.floor(viewer.renderers.coronalCrosshairs.getCanvasWidth()/2),
			Math.floor(viewer.renderers.coronalCrosshairs.getCanvasHeight()/2)
		);
		viewer.renderers.sagittalCrosshairs.render(
			Math.floor(viewer.renderers.sagittalCrosshairs.getCanvasWidth()/2),
			Math.floor(viewer.renderers.sagittalCrosshairs.getCanvasHeight()/2)
		);
		viewer.renderers.axialCrosshairs.render(
			Math.floor(viewer.renderers.axialCrosshairs.getCanvasWidth()/2),
			Math.floor(viewer.renderers.axialCrosshairs.getCanvasHeight()/2)
		);
	}

});
