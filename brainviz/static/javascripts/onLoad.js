$(window).load(function(){
	var data = loadJsonDataFromLocation('/image/getdata');
	
	//load the data into the viewer
	viewer.brainImage.data = data;
	
	//load the drawing canvases into the viewer
	viewer.canvases.coronalCanvas = $('canvas#coronal').first()[0]
	viewer.canvases.sagittalCanvas = $('canvas#sagittal').first()[0]
	viewer.canvases.axialCanvas = $('canvas#axial').first()[0]
	
	//load the renderers into the viewer
	viewer.renderers.coronalRenderer =
		new brainOrientationRenderer(
			viewer.brainImage.getCoronalData, 
			viewer.canvases.coronalCanvas, 'Coronal', 4
		);
	viewer.renderers.sagittalRenderer = 		
		new brainOrientationRenderer(
			viewer.brainImage.getSagittalData,
			viewer.canvases.sagittalCanvas, 'Sagittal', 4
		);
	viewer.renderers.axialRenderer =	
		new brainOrientationRenderer(
			viewer.brainImage.getAxialData,
			viewer.canvases.axialCanvas, 'Axial', 4
		);

	//render some default slices
	viewer.renderers.coronalRenderer.displaySlice(30);
	viewer.renderers.sagittalRenderer.displaySlice(30);
	viewer.renderers.axialRenderer.displaySlice(30);
	
	//subscribe the displays to the event handlers
	viewer.listeners.dispatchAxialData.subscribe(
		viewer.publishers.onCoronalClick
	);
	viewer.listeners.dispatchAxialData.subscribe(
		viewer.publishers.onSagittalClick
	);
	viewer.listeners.dispatchCoronalData.subscribe(
		viewer.publishers.onSagittalClick
	);
	viewer.listeners.dispatchCoronalData.subscribe(
		viewer.publishers.onAxialClick
	);
	viewer.listeners.dispatchSagittalData.subscribe(
		viewer.publishers.onAxialClick
	);
	viewer.listeners.dispatchSagittalData.subscribe(
		viewer.publishers.onCoronalClick
	);
	
	/*
	 * these are the onclick bindings
	 * we have to pass in the renderers as eventdata to the callback
	 * functions, otherwise the 'this' object in the viewer/renderer will 
	 * refer to the actual browser window instead of the controlling object
	 */
	$('#coronal').bind( 'click',
		{
			sagittalRenderer: viewer.renderers.sagittalRenderer,
			axialRenderer: viewer.renderers.axialRenderer,
		},
		function(event){
			//offset contains offset.left and offset.top
			var offset = $(this).offset();
			//minus one on both of these as they are to represent slices, 
			//not pixels
			var relativeX = event.pageX - offset.left - 1;
			var relativeY = event.pageY - offset.top - 1;
			var sagSlice = relativeX / viewer.renderers.sagittalRenderer.pixelSize;
			var axSlice = relativeY / viewer.renderers.axialRenderer.pixelSize;
			viewer.publishers.onCoronalClick.deliver({
				sagittalSlice : sagSlice,
				sagittalRenderer: event.data.sagittalRenderer,
				axialSlice : axSlice,
				axialRenderer : event.data.axialRenderer,
			});
		}
	);
	
	$('#sagittal').bind('click',
		{
			coronalRenderer : viewer.renderers.coronalRenderer,
			axialRenderer : viewer.renderers.axialRenderer,
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
			viewer.publishers.onSagittalClick.deliver({
				coronalSlice : corSlice,
				coronalRenderer: event.data.coronalRenderer,
				axialSlice : axSlice,
				axialRenderer : event.data.axialRenderer,
			});
		}
	);
	
	$('#axial').bind('click',
		{
			sagittalRenderer: viewer.renderers.sagittalRenderer,
			coronalRenderer : viewer.renderers.coronalRenderer,
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
			viewer.publishers.onAxialClick.deliver({
				coronalSlice : corSlice,
				coronalRenderer: event.data.coronalRenderer,
				sagittalSlice : sagSlice,
				sagittalRenderer: event.data.sagittalRenderer,
			});
		}
	);
	
});
