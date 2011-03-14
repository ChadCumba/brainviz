/*
 * this was originally only meant to be a namespace, but has since mutated into
 * an almost complete class on its own. It is now in need of some refactoring
 */
var viewer = {
	
	instantiated : false,
	
	init: function(imageURL, canvases, texts, thresholds, backgroundFillCallback,
			backgrounds) {
		if(this.instantiated){
			return;
		}
		
		var heatMap = loadJsonDataFromLocation(imageUrl);
		
		for(var i = 0; i < heatMap.data.length; i++){
			heatMap.data[i].reverse();
			for(var j = 0; j < heatMap.data[i].length; j++){
				heatMap.data[i][j].reverse();
			}
		}
		
		//load the data into the viewer
		this.brainImage = new brainData(heatMap.data, heatMap.max,
											heatMap.min);
		
		//load the drawing canvases into the viewer
		this.canvases.coronalCanvas = $(canvases.coronal).first()[0]
		this.canvases.sagittalCanvas = $(canvases.sagittal).first()[0]
		this.canvases.axialCanvas = $(canvases.axial).first()[0]
		
		//load the text output objects into the viewer
		this.textOutput.coordinateObject = $(texts.coordinates).first()[0];
		this.textOutput.voxelObject = $(texts.voxel).first()[0];
		this.textOutput.urlObject = $(texts.url).first()[0];
		this.textOutput.thresholdObject = $(texts.threshold).first()[0];
		
		//load the renderers into the viewer
		this.renderers.coronalRenderer =
			new brainOrientationRenderer(
				this.brainImage,
				this.brainImage.getCoronalData, 
				this.canvases.coronalCanvas, 'Coronal', 4,
				backgroundFillCallback
			);
		this.renderers.sagittalRenderer = 		
			new brainOrientationRenderer(
				this.brainImage,
				this.brainImage.getSagittalData,
				this.canvases.sagittalCanvas, 'Sagittal', 4,
				backgroundFillCallback
			);
		this.renderers.axialRenderer =	
			new brainOrientationRenderer(
				this.brainImage,
				this.brainImage.getAxialData,
				this.canvases.axialCanvas, 'Axial', 4,
				backgroundFillCallback
			);
		this.renderers.coronalCrosshairs = 
			new crosshairsRenderer(
				this.canvases.coronalCanvas,
				1,
				'#FFFFFF' //white
			);
		this.renderers.sagittalCrosshairs = 
			new crosshairsRenderer(
				this.canvases.sagittalCanvas,
				1,
				'#FFFFFF' 
			);
		this.renderers.axialCrosshairs = 
			new crosshairsRenderer(
				this.canvases.axialCanvas,
				1,
				'#FFFFFF' 
			);
			
		this.renderers.coronalBackgroundRenderer = 
			new brainBackgroundImageRenderer(
				backgrounds.coronal,
				this.canvases.coronalCanvas,
				null,
				'#000000'
			);
			
		this.renderers.sagittalBackgroundRenderer = 
			new brainBackgroundImageRenderer(
				backgrounds.sagittal,
				this.canvases.sagittalCanvas,
				null,
				//'#D0D0D0'
				'#000000'
			);
		this.renderers.axialBackgroundRenderer = 
			new brainBackgroundImageRenderer(
				backgrounds.axial,
				this.canvases.axialCanvas,
				null,
				'#000000'
			);
	
		//subscribe the listeners to the event handlers
		this.listeners.dispatchRenderingData.subscribe(
			this.publishers.onSagittalChange
		);
		this.listeners.dispatchRenderingData.subscribe(
			this.publishers.onAxialChange
		);
		this.listeners.dispatchRenderingData.subscribe(
			this.publishers.onCoronalChange
		);
		this.listeners.updateTextDisplay.subscribe(
			this.publishers.onCrosshairChange
		);
		this.listeners.updateThresholds.subscribe(
			this.publishers.onThresholdChange
		);
	
		
		//sets the click handling bindings
		this.setEventBindings();
		
		$(thresholds.slider).slider({max: this.brainImage.getMax(),
			min : this.brainImage.getMin(),
			value : thresholds.value,
			orientation: thresholds.orientation,
		}).bind('slide', {
			coronalRenderer : this.renderers.coronalRenderer,
			onThresholdChange : this.publishers.onThresholdChange,
			brainImage : this.brainImage,
		},
			function(event, ui){
				currentThreshold = event.coronalRenderer.getThreshold();
				range = currentThreshold - ui.value;
				range = Math.abs(range);
				scale = Math.abs(event.brainImage.getMax() -
					event.brainImage.getMin());
				if(range/scale > .1){
					//if there is more than a 10% change in the threshold,
					//rerender with the new value to give the illusion of 
					//responsiveness 
					event.onThresholdChange.deliver(ui.value);
				}
		}).bind('slidechange',
			{
				onThresholdChange: this.publishers.onThresholdChange,
			},
			function(event, ui){
				event.onThresholdChange.deliver(ui.value);
			} 
		);
		
	},
	
	constants : {
		coordinateMultiplier : 1.5,
		smallDimension : 91,
		largeDimension : 109,
	},
	
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
		onThresholdChange : new Publisher(),
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
		 * This is sort of a down and dirty composite class
		 * It should likely be refactored to an actual composite, but that 
		 * can wait for now.
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
				"X: "+data.coordX+" Y: "+data.coordY+" Z: "+data.coordZ);
			
			$(viewer.textOutput.voxelObject).html(data.voxelValue);
			
			$(viewer.textOutput.urlObject).html('Permalink to this page');
			$(viewer.textOutput.urlObject).attr('href',data.url);
			
		},
		
		updateThresholds : function(data){
			if (data != null){
				viewer.threshold = data;
				viewer.renderers.coronalRenderer.setThreshold(data);
				viewer.renderers.sagittalRenderer.setThreshold(data);
				viewer.renderers.axialRenderer.setThreshold(data);
				viewer.staticFunctions.rerenderAll();
				$(viewer.textOutput.thresholdObject).html(data);
			}
		}
	
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
		coronalBackgroundRenderer: null,
		sagittalBackgroundRenderer : null,
		axialBackgroundRenderer : null,
	},
	
	textOutput : {
		coordinateObject : null,
		voxelObject : null,
		urlObject : null,
		thresholdObject: null,
	},
	
	threshold : null,
	
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
				coronalBackgroundRenderer : viewer.renderers.coronalBackgroundRenderer,
				sagittalBackgroundRenderer : viewer.renderers.sagittalBackgroundRenderer,
				axialBackgroundRenderer : viewer.renderers.axialBackgroundRenderer,
				constants : viewer.constants,
				staticFunctions : viewer.staticFunctions,
				canvases : viewer.canvases,
				brainImage : viewer.brainImage,
				publishers : viewer.publishers,
				threshold : viewer.threshold,
			},
			function(event){
				//offset contains offset.left and offset.top
				var coords = event.data.staticFunctions.resolveCrosshairCoords(
					this, event);
				
				var relativeX = coords.relativeX;
				var relativeY = coords.relativeY;
				
				var sagSlice = relativeX / event.data.sagittalRenderer.pixelSize;
				var axSlice = relativeY / event.data.axialRenderer.pixelSize;
				
				var voxelValue = event.data.brainImage.data
					[event.data.coronalRenderer.getLastSlice()]
					[Math.floor(sagSlice)]
					[Math.floor(axSlice)];
				
				
				viewer.publishers.onCrosshairChange.deliver({
					'coordX' : Math.floor(event.data.coronalRenderer.getLastSlice() *
						event.data.constants.coordinateMultiplier),
					'coordY' : viewer.constants.largeDimension - 
						Math.floor(relativeX * (event.data.constants.largeDimension /
						event.data.canvases.coronalCanvas.width)),
					'coordZ' : event.data.constants.smallDimension - 
						Math.floor(relativeY * (event.data.constants.smallDimension / 
						event.data.canvases.coronalCanvas.height)),
					'voxelValue' : voxelValue,
					'url' :	window.location.protocol + "//" + window.location.host + 
					window.location.pathname + "?axis=coronal&slice=" + 
					event.data.coronalRenderer.getLastSlice() + '&clickX=' +
					relativeX + '&clickY=' +relativeY + '&threshold=' +
					event.data.threshold
				});

			
				event.data.canvases.coronalCanvas.width = 
					event.data.canvases.coronalCanvas.width;
				event.data.canvases.sagittalCanvas.width = 
					event.data.canvases.sagittalCanvas.width;
				event.data.canvases.axialCanvas.width = 
					event.data.canvases.axialCanvas.width;
				
				/*
				 * it would be more clear to deliver an object below,
				 * however many versions of IE do not support for ... in syntax
				 * and thus we are using a list so that we can iterate over it
				 * 
				 * Note that in addition to the list of renderingGroups we are
				 * also passing on the event data. The current implementation does 
				 * not use it, but it may be useful to other subscribers down the road.
				 */
				event.data.publishers.onCoronalChange.deliver([
					
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
					},
					{
						renderArgs : event.data.coronalRenderer.getLastSlice(),
						renderer : event.data.coronalBackgroundRenderer,
						weight : 0,
					},
					{
						renderArgs : Math.floor(axSlice),
						renderer : event.data.axialBackgroundRenderer,
						weight : 0,
					},
					{
						renderArgs : Math.floor(sagSlice),
						renderer : event.data.sagittalBackgroundRenderer,
						weight : 0,
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
				coronalBackgroundRenderer : viewer.renderers.coronalBackgroundRenderer,
				sagittalBackgroundRenderer : viewer.renderers.sagittalBackgroundRenderer,
				axialBackgroundRenderer : viewer.renderers.axialBackgroundRenderer,
				constants : viewer.constants,
				staticFunctions : viewer.staticFunctions,
				canvases : viewer.canvases,
				brainImage : viewer.brainImage,
				publishers : viewer.publishers,
				threshold : viewer.threshold,
			},
			function(event){
				//offset contains offset.left and offset.top
				var coords = event.data.staticFunctions.resolveCrosshairCoords(
					this, event);
				
				var relativeX = coords.relativeX;
				var relativeY = coords.relativeY;
				
				var corSlice = relativeX / event.data.coronalRenderer.pixelSize;
				var axSlice = relativeY / event.data.axialRenderer.pixelSize;
				
				var voxelValue = viewer.brainImage.data
					[Math.floor(corSlice)]
					[event.data.sagittalRenderer.getLastSlice()]
					[ Math.floor(axSlice)];
				
				event.data.publishers.onCrosshairChange.deliver({
					'coordX' : Math.floor(relativeX * (event.data.constants.smallDimension /
						event.data.canvases.sagittalCanvas.width)),
					'coordY' : event.data.constants.largeDimension - 
						Math.floor(event.data.sagittalRenderer.getLastSlice() * 
						event.data.constants.coordinateMultiplier),
					'coordZ' : event.data.constants.smallDimension - 
						Math.floor(relativeY * (event.data.constants.smallDimension /
						event.data.canvases.sagittalCanvas.height)),
					'voxelValue' : voxelValue,
					'url' :	window.location.protocol + "//" + window.location.host + 
					window.location.pathname + "?axis=sagittal&slice=" + 
					event.data.sagittalRenderer.getLastSlice() + '&clickX=' +
					relativeX + '&clickY=' +relativeY + '&threshold=' +
					event.data.threshold
				});

				event.data.canvases.coronalCanvas.width = 
					event.data.canvases.coronalCanvas.width;
				event.data.canvases.sagittalCanvas.width = 
					event.data.canvases.sagittalCanvas.width;
				event.data.canvases.axialCanvas.width = 
					event.data.canvases.axialCanvas.width;
				
			
				
				event.data.publishers.onSagittalChange.deliver([
					
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
					},
					{
						renderArgs : Math.floor(corSlice),
						renderer : event.data.coronalBackgroundRenderer,
						weight : 0,
					},
					{
						renderArgs : Math.floor(axSlice),
						renderer : event.data.axialBackgroundRenderer,
						weight : 0,
					},
					{
						renderArgs : event.data.sagittalRenderer.getLastSlice(),
						renderer : event.data.sagittalBackgroundRenderer,
						weight : 0,
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
				coronalBackgroundRenderer : viewer.renderers.coronalBackgroundRenderer,
				sagittalBackgroundRenderer : viewer.renderers.sagittalBackgroundRenderer,
				axialBackgroundRenderer : viewer.renderers.axialBackgroundRenderer,
				constants : viewer.constants,
				staticFunctions : viewer.staticFunctions,
				canvases : viewer.canvases,
				brainImage : viewer.brainImage,
				publishers : viewer.publishers,
				threshold : viewer.threshold,
			},
			function(event){
				//offset contains offset.left and offset.top
				//in the event callback context, this refers to the canvas element
				
				var coords = event.data.staticFunctions.resolveCrosshairCoords(
					this, event);
				
				var relativeX = coords.relativeX;
				var relativeY = coords.relativeY;
				
				var sagSlice = relativeY / event.data.coronalRenderer.pixelSize;
				var corSlice = relativeX / event.data.sagittalRenderer.pixelSize;
	
				var voxelValue = event.data.brainImage.data
					[Math.floor(corSlice)]
					[ Math.floor(sagSlice)]
					[event.data.axialRenderer.getLastSlice()];
				
				event.data.publishers.onCrosshairChange.deliver({
					'coordX' : Math.floor(relativeX * (event.data.constants.smallDimension /
						event.data.canvases.axialCanvas.width)),
					'coordY' : event.data.constants.largeDimension - 
						Math.floor(relativeY * (event.data.constants.largeDimension /
						event.data.canvases.axialCanvas.height)),
					'coordZ' : event.data.constants.smallDimension - 
						Math.floor(event.data.axialRenderer.getLastSlice() *
						event.data.constants.coordinateMultiplier),
					'voxelValue' : voxelValue,
					'url' :	window.location.protocol + "//" + window.location.host + 
					window.location.pathname + "?axis=axial&slice=" + 
					event.data.axialRenderer.getLastSlice() + '&clickX=' +
					relativeX + '&clickY=' +relativeY + '&threshold=' +
					event.data.threshold
				});
	
				event.data.canvases.coronalCanvas.width = 
					event.data.canvases.coronalCanvas.width;
				event.data.canvases.sagittalCanvas.width = 
					event.data.canvases.sagittalCanvas.width;
				event.data.canvases.axialCanvas.width = 
					event.data.canvases.axialCanvas.width;
				
				event.data.publishers.onAxialChange.deliver([
					
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
					{
						renderArgs : Math.floor(corSlice),
						renderer : event.data.coronalBackgroundRenderer,
						weight : 0,
					},
					{
						renderArgs : Math.floor(sagSlice),
						renderer : event.data.sagittalBackgroundRenderer,
						weight : 0,
					},
					{
						renderArgs : event.data.axialRenderer.getLastSlice(),
						renderer : event.data.axialBackgroundRenderer,
						weight : 0,
					}
					
					
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
		
		rerenderAll : function() {
			clickEvent = $.Event('click');
			clickEvent.relativeX = viewer.renderers.sagittalCrosshairs.getLastX();
			clickEvent.relativeY = viewer.renderers.sagittalCrosshairs.getLastY();
			$(viewer.canvases.sagittalCanvas).trigger(clickEvent);
		},
	},
};
