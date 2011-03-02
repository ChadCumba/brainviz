
var viewer = {
	
	/*
	 * functions that publish data for events
	 */
	publishers : {
		onCoronalChange : new Publisher(),
		onSagittalChange : new Publisher(),
		onAxialChange : new Publisher(),
		onCoronalRenderingComplete : new Publisher(),
		onSagittalRenderingComplete : new Publisher(),
		onAxialRenderingComplete : new Publisher(),
		onCrosshairChange : new Publisher(),
	},
	
	/*
	 * listening functions that sort out the data delivered from 
	 * the publishers
	 */
	listeners : {
		
		/*
		 * Takes in a list of renderingGroups and calls displaySlice on the
		 * renderer in each group with the slice number provided in the group
		 * 
		 * @param renderingGroups - takes a list of objects, each should 
		 * 							contain the members slice, renderer, and weight.
		 * 							Slice is the slice to render, renderer is 
		 * 							the renderer to dispatch to, and weight is
		 * 							the order to render in (heavier items render
		 * 							later than lighter items)
		 */
		dispatchRenderingData : function(renderingGroups) {
			if(renderingGroups == null){
				throw ('dispatch called with no arguments');
				return;
			}
			if(renderingGroups.length == 0){
				throw('no renderer to dispatch to');
				return;
			}
			for(var i = 0; i < renderingGroups.length; i++){
				if(renderingGroups[i].renderArgs == undefined ){
					throw('attempting to dispatch renderer number '+i
					+' with no slice');	
				}
				if(renderingGroups[i].renderer == undefined){
					throw('attempting to dispatch renderer number '+i
					+' with no renderer');
				}
				if(renderingGroups[i].weight == undefined){
					throw('attempting to dispatch renderer number '+i
					+' with no weight')
				}
			}
			
			renderingGroups.sort(function(a,b){
				if(a.weight > b.weight){
					return 1;
				}
				if(a.weight < b.weight){
					return -1;
				}
				return 0;
			});
			
			for (var i = 0; i < renderingGroups.length; i++){
				renderingGroups[i].renderer.render(
					renderingGroups[i].renderArgs
				);
			}

		},
		
		updateTextDisplay : function(data){

			$(viewer.textOutput.coordinateObject).html(
				data.coordX+" "+data.coordY+" "+data.coordZ);
			
			$(viewer.textOutput.voxelObject).html(data.voxelValue);
			
			$(viewer.textOutput.urlObject).html('Permalink to this page');
			$(viewer.textOutput.urlObject).attr('href',data.url);
		},
	
	},
	
	/*
	 * the actual canvas objects to draw on
	 */
	canvases : {
		coronalCanvas : null,
		sagittalCanvas : null,
		axialCanvas : null,
	},
	
	/*
	 * the image data that will be displayed
	 */
	brainImage : null,
	
	/*
	 * the background that will be displayed
	 */
	brainBackground : null,

	/*
	 * the renderers that will display the data
	 * these need to be instantiated after the data has been loaded.
	 */
	renderers : {
		coronalRenderer : null,
		sagittalRenderer : null,
		axialRenderer : null,
		coronalCrosshairs : null,
		sagittalCrosshairs : null,
		axialCrosshairs : null,
	},
	
	textOutput : {
		coordinateObject : null,
		voxelObject : null,
		urlObject : null,
	},
	
	/*
	 * these are the onclick bindings
	 * we have to pass in the renderers as eventdata to the callback
	 * functions, because the 'this' object in the viewer/renderer will 
	 * refer to the actual browser window instead of the controlling object
	 */
	setEventBindings : function (){
		$(viewer.canvases.coronalCanvas).bind( 'click',
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
				var coords = viewer.staticFunctions.resolveCrosshairCoords(
					this, event);
				
				var relativeX = coords.relativeX;
				var relativeY = coords.relativeY;
				
				var sagSlice = relativeX / event.data.sagittalRenderer.pixelSize;
				var axSlice = relativeY / event.data.axialRenderer.pixelSize;
				
				var voxelValue = viewer.brainImage.data
					[event.data.coronalRenderer.getLastSlice()]
					[Math.floor(sagSlice)]
					[Math.floor(axSlice)];
				
				
				viewer.publishers.onCrosshairChange.deliver({
					'coordX' : event.data.coronalRenderer.getLastSlice(),
					'coordY' : Math.floor(sagSlice),
					'coordZ' : Math.floor(axSlice),
					'voxelValue' : voxelValue,
					'url' :	window.location.protocol + "//" + window.location.host + 
					window.location.pathname + "?axis=coronal&slice=" + 
					event.data.coronalRenderer.getLastSlice() + '&clickX=' +
					relativeX + '&clickY=' +relativeY
				});

			
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
		
		$(viewer.canvases.sagittalCanvas).bind('click',
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
				var coords = viewer.staticFunctions.resolveCrosshairCoords(
					this, event);
				
				var relativeX = coords.relativeX;
				var relativeY = coords.relativeY;
				
				var corSlice = relativeX / viewer.renderers.coronalRenderer.pixelSize;
				var axSlice = relativeY / viewer.renderers.axialRenderer.pixelSize;
				
				var voxelValue = viewer.brainImage.data
					[Math.floor(corSlice)]
					[event.data.sagittalRenderer.getLastSlice()]
					[ Math.floor(axSlice)];
				
				viewer.publishers.onCrosshairChange.deliver({
					'coordX' : Math.floor(corSlice),
					'coordY' : event.data.sagittalRenderer.getLastSlice(),
					'coordZ' : Math.floor(axSlice),
					'voxelValue' : voxelValue,
					'url' :	window.location.protocol + "//" + window.location.host + 
					window.location.pathname + "?axis=sagittal&slice=" + 
					event.data.sagittalRenderer.getLastSlice() + '&clickX=' +
					relativeX + '&clickY=' +relativeY
				});

				
				$(viewer.textOutput.coordinateObject).html(
					Math.floor(corSlice)+" "
					+event.data.sagittalRenderer.getLastSlice()+" "
					+Math.floor(axSlice)				
				);
				
				$(viewer.textOutput.voxelObject).html(voxelValue);
				
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
		
		$(viewer.canvases.axialCanvas).bind('click',
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
				//in the event callback context, this refers to the canvas element
				
				var coords = viewer.staticFunctions.resolveCrosshairCoords(
					this, event);
				
				var relativeX = coords.relativeX;
				var relativeY = coords.relativeY;
				
				var sagSlice = relativeY / viewer.renderers.coronalRenderer.pixelSize;
				var corSlice = relativeX / viewer.renderers.sagittalRenderer.pixelSize;
	
				var voxelValue = viewer.brainImage.data
					[Math.floor(corSlice)]
					[ Math.floor(sagSlice)]
					[event.data.axialRenderer.getLastSlice()];
				
				viewer.publishers.onCrosshairChange.deliver({
					'coordX' : Math.floor(corSlice),
					'coordY' : Math.floor(sagSlice),
					'coordZ' : event.data.axialRenderer.getLastSlice(),
					'voxelValue' : voxelValue,
					'url' :	window.location.protocol + "//" + window.location.host + 
					window.location.pathname + "?axis=axial&slice=" + 
					event.data.axialRenderer.getLastSlice() + '&clickX=' +
					relativeX + '&clickY=' +relativeY
				});

				
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
	},
	
	staticFunctions :{
		resolveCrosshairCoords: function(canvas, event){
			var offset = $(canvas).offset();
			//minus one on both of these as they are to represent slices, 
			//not pixels
			var relativeX;
			var relativeY;
			if(event.relativeX != undefined && event.relativeY != undefined){
				relativeX = event.relativeX;
				relativeY = event.relativeY;
			}else{
				relativeX = event.pageX - offset.left - 1;
				relativeY = event.pageY - offset.top - 1;
			}
			return {'relativeX' : relativeX, 'relativeY' : relativeY};
		},
	},
};
