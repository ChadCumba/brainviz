$(window).load(function(){
	//var background = loadJsonDataFromLocation('/image/getbackground');
	//var foreground = loadJsonDataFromLocation('/image/getimage');
	var background = loadJsonDataFromLocation('/image/getimage');
	//load the data into the viewer
	viewer.brainImage = new brainData(background.data, background.max,
										background.min);
	
	//load the drawing canvases into the viewer
	viewer.canvases.coronalCanvas = $('canvas#coronal').first()[0]
	viewer.canvases.sagittalCanvas = $('canvas#sagittal').first()[0]
	viewer.canvases.axialCanvas = $('canvas#axial').first()[0]
	
	
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
			viewer.brainImage.getCoronalData, 
			viewer.canvases.coronalCanvas, 'Coronal', 4,
			backgroundFillCallback
		);
	viewer.renderers.sagittalRenderer = 		
		new brainOrientationRenderer(
			viewer.brainImage.getSagittalData,
			viewer.canvases.sagittalCanvas, 'Sagittal', 4,
			backgroundFillCallback
		);
	viewer.renderers.axialRenderer =	
		new brainOrientationRenderer(
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
	
	
	/*
	 * these are the onclick bindings
	 * we have to pass in the renderers as eventdata to the callback
	 * functions, because the 'this' object in the viewer/renderer will 
	 * refer to the actual browser window instead of the controlling object
	 */
	$('#coronal').bind( 'click',
		{
			sagittalRenderer: viewer.renderers.sagittalRenderer,
			axialRenderer: viewer.renderers.axialRenderer,
			coronalCrosshairs : viewer.renderers.coronalCrosshairs,
			coronalRenderer : viewer.renderers.coronalRenderer,
			sagittalCrosshairs : viewer.renderers.sagittalCrosshairs,
			axialCrosshairs : viewer.renderers.axialCrosshairs,
		},
		function(event){
			//offset contains offset.left and offset.top
			var offset = $(this).offset();
			//minus one on both of these as they are to represent slices, 
			//not pixels
			var relativeX = event.pageX - offset.left - 1;
			var relativeY = event.pageY - offset.top - 1;
			var sagSlice = relativeX / event.data.sagittalRenderer.pixelSize;
			var axSlice = relativeY / event.data.axialRenderer.pixelSize;
			
			var voxelValue = viewer.brainImage.data
				[event.data.coronalRenderer.getLastSlice()]
				[Math.floor(sagSlice)]
				[viewer.brainImage.data[0][0].length - Math.floor(axSlice) -1];
			
			
			$('#coords > p').html(
				event.data.coronalRenderer.getLastSlice()+" "
				+Math.floor(sagSlice)+" "+Math.floor(axSlice)				
			);
			
			$('#voxel-data > p').html(voxelValue);
			/*
			 * it would be more clear to deliver an object below,
			 * however many versions of IE do not support for ... in syntax
			 * and thus we are using a list so that we can iterate over it
			 * 
			 * Note that in addition to the list of renderingGroups we are
			 * also passing on the event data. The current implementation does 
			 * not use it, but it may be useful to other subscribers down the road.
			 */
			viewer.publishers.onCoronalChange.deliver([
				
				{
					renderArgs : Math.floor(sagSlice),
					renderer : event.data.sagittalRenderer,
					weight : 1,
				},
				
				{
					renderArgs : Math.floor(axSlice),
					renderer : event.data.axialRenderer,
					weight : 1,
				},
				{
					renderArgs : [ relativeX, relativeY ],
					renderer : event.data.coronalCrosshairs,
					weight : 2,
				},
				{
					renderArgs : event.data.coronalRenderer.getLastSlice(),
					renderer : event.data.coronalRenderer,
					weight : 1,
				},
				{
					renderArgs : [  event.data.coronalRenderer.getLastSlice() 
									* event.data.coronalRenderer.pixelSize,
									relativeY],
					renderer : event.data.sagittalCrosshairs,
					weight : 2,
				},
				{
					renderArgs : [  event.data.coronalRenderer.getLastSlice() 
									* event.data.coronalRenderer.pixelSize,
									relativeX ],
					renderer : event.data.axialCrosshairs,
					weight : 2,
				}
				
			], event);
		}
	);
	
	$('#sagittal').bind('click',
		{
			sagittalRenderer: viewer.renderers.sagittalRenderer,
			axialRenderer: viewer.renderers.axialRenderer,
			coronalCrosshairs : viewer.renderers.coronalCrosshairs,
			coronalRenderer : viewer.renderers.coronalRenderer,
			sagittalCrosshairs : viewer.renderers.sagittalCrosshairs,
			axialCrosshairs : viewer.renderers.axialCrosshairs,
		},
		function(event){
			//offset contains offset.left and offset.top
			var offset = $(this).offset();
			//minus one on both of these as they are to represent slices, 
			//not pixels
			var relativeX = event.pageX - offset.left - 1;
			var relativeY = event.pageY - offset.top - 1;
			var corSlice = relativeX / viewer.renderers.coronalRenderer.pixelSize;
			var axSlice = relativeY / viewer.renderers.axialRenderer.pixelSize;
			
			var voxelValue = viewer.brainImage.data
				[Math.floor(corSlice)]
				[event.data.sagittalRenderer.getLastSlice()]
				[viewer.brainImage.data[0][0].length - 1 - Math.floor(axSlice)];
			
			
			$('#coords > p').html(
				Math.floor(corSlice)+" "
				+event.data.sagittalRenderer.getLastSlice()+" "
				+Math.floor(axSlice)				
			);
			
			$('#voxel-data > p').html(voxelValue);
			
			viewer.publishers.onSagittalChange.deliver([
				
				{
					renderArgs : Math.floor(corSlice),
					renderer : event.data.coronalRenderer,
					weight : 1,
				},
				
				{
					renderArgs : Math.floor(axSlice),
					renderer : event.data.axialRenderer,
					weight : 1,
				},
				{
					renderArgs : event.data.sagittalRenderer.getLastSlice(),
					renderer : event.data.sagittalRenderer,
					weight : 1,
				},
				{
					renderArgs : [relativeX, relativeY],
					renderer : event.data.sagittalCrosshairs,
					weight : 2,
				},
				{
					renderArgs : [ event.data.sagittalRenderer.getLastSlice() 
								* event.data.sagittalRenderer.pixelSize,
								relativeY],
					renderer : event.data.coronalCrosshairs,
					weight : 2,
				},
				{
					renderArgs : [ relativeX,
								event.data.sagittalRenderer.getLastSlice() 
								* event.data.sagittalRenderer.pixelSize ],
					renderer : event.data.axialCrosshairs,
					weight : 2,
				}
				
			], event);
		}
	);
	
	$('#axial').bind('click',
		{
			sagittalRenderer: viewer.renderers.sagittalRenderer,
			axialRenderer: viewer.renderers.axialRenderer,
			coronalCrosshairs : viewer.renderers.coronalCrosshairs,
			coronalRenderer : viewer.renderers.coronalRenderer,
			sagittalCrosshairs : viewer.renderers.sagittalCrosshairs,
			axialCrosshairs : viewer.renderers.axialCrosshairs,
		},
		function(event){
			//offset contains offset.left and offset.top
			var offset = $(this).offset();
			//minus one on both of these as they are to represent slices, 
			//not pixels
			var relativeX = event.pageX - offset.left - 1;
			var relativeY = event.pageY - offset.top - 1;
			var sagSlice = relativeY / viewer.renderers.coronalRenderer.pixelSize;
			var corSlice = relativeX / viewer.renderers.sagittalRenderer.pixelSize;

			var voxelValue = viewer.brainImage.data
				[Math.floor(corSlice)]
				[viewer.brainImage.data[0].length - 1 - Math.floor(sagSlice)]
				[event.data.axialRenderer.getLastSlice()];
			
			
			$('#coords > p').html(
				Math.floor(corSlice)+" "
				+Math.floor(sagSlice)+" "
				+event.data.axialRenderer.getLastSlice()				
			);
			
			$('#voxel-data > p').html(voxelValue);			
			
			viewer.publishers.onAxialChange.deliver([
				
				{
					renderArgs : Math.floor(corSlice),
					renderer : event.data.coronalRenderer,
					weight : 1,
				},
				
				{
					renderArgs : Math.floor(sagSlice),
					renderer : event.data.sagittalRenderer,
					weight : 1,
				},
				{
					renderArgs : event.data.axialRenderer.getLastSlice(),
					renderer : event.data.axialRenderer,
					weight : 1,
				},
				{
					renderArgs : [relativeX, relativeY],
					renderer : event.data.axialCrosshairs,
					weight: 2,
				},
				{
					renderArgs : [relativeX, 
									event.data.axialRenderer.getLastSlice()
									* event.data.axialRenderer.pixelSize],
					renderer : event.data.sagittalCrosshairs,
					weight : 2,
				},
				{
					renderArgs : [relativeY, 
									event.data.axialRenderer.getLastSlice()
									* event.data.axialRenderer.pixelSize ],
					renderer : event.data.coronalCrosshairs,
					weight : 2,
				},
				
				
			], event);
		}
	);
	
});
