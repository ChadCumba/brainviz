/*
 * this was originally only meant to be a namespace, but has since mutated into
 * an almost complete class on its own. It is now in need of some refactoring
 */
var viewer = {
	
	instantiated : false,
	
	/*
	 * @param imageURL - string describing the url to load data from
	 * @param canvases - object that responds to coronal, sagittal, and axial
	 * 					and contains the requisite canvases
	 * @param texts - object that responds to coordinates, voxel, url, and 
	 * 					threshold and contains the requisite dom objects
	 * @param thresholds - object that responds to slider, value, and orientation.
	 * 						slider is a dom object to paint the slider on,
	 * 						value is the starting value of the slider, and 
	 * 						orientation is either "vertical" or "horizontal"
	 * @param backgroundFillCallback - callback function that returns a css color
	 * @param backgrounds - object that responds to coronal, sagittal, and axial.
	 * 						contains the background arrays for each canvas.
	 */
	init: function(rawImageData, canvases, texts, thresholds,backgroundFillCallback,
		backgrounds, storageCallback, retrievalCallback) {
			
		if(this.instantiated){
			return;
		}
		
		var heatMap = rawImageData;
		
		for(var i = 0; i < heatMap.data.length; i++){
			heatMap.data[i].reverse();
			for(var j = 0; j < heatMap.data[i].length; j++){
				heatMap.data[i][j].reverse();
			}
		}
		
		//compute the size of the brush (pixel) we'll be painting the canvases
		//with
		var brushSize = canvases.sagittal.width / i;
		
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
			
		//check if the store and retrieve functions are set
		if(storageCallback != null && typeof storageCallback == 'function'
			&& retrievalCallback != null && typeof retrievalCallback == 'function'){
			//both are set and both are functions, we can create cache objects
			this.caches.coronalCache = new canvasCache(
				this.canvases.coronalCanvas,
				storageCallback,
				retrievalCallback
			);
			this.caches.sagittalCache = new canvasCache(
				this.canvases.sagittalCanvas,
				storageCallback,
				retrievalCallback
			);
			this.caches.axialCache = new canvasCache(
				this.canvases.axialCanvas,
				storageCallback,
				retrievalCallback
			);
		}
		
		//load the renderers into the viewer
		this.renderers.coronalRenderer =
			new brainOrientationRenderer(
				this.brainImage, //image object reference
				this.brainImage.getCoronalData, //image slice callback
				this.canvases.coronalCanvas, 'Coronal', brushSize, //canvas info
				backgroundFillCallback, //callback that generates the background
				null, //callback to fire after rendering is complete (optional)
				this.caches.coronalCache //a cache object that responds to store and retrieve
			);
		this.renderers.sagittalRenderer = 		
			new brainOrientationRenderer(
				this.brainImage,
				this.brainImage.getSagittalData,
				this.canvases.sagittalCanvas, 'Sagittal', brushSize,
				backgroundFillCallback,
				null,
				this.caches.sagittalCache
			);
		this.renderers.axialRenderer =	
			new brainOrientationRenderer(
				this.brainImage,
				this.brainImage.getAxialData,
				this.canvases.axialCanvas, 'Axial', brushSize,
				backgroundFillCallback,
				null,
				this.caches.axialCache
			);
		this.renderers.coronalCrosshairs = 
			new crosshairsRenderer(
				this.canvases.coronalCanvas, //canvas object
				1, //thickness of the crosshair line in px
				'#FFFFFF' //crosshair color - white
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
				'#000000' //black
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
		/*
		 * this.listeners.whatever will be called and passed a data object 
		 * when the publisher it is subscribed to is triggered
		 */
		this.listeners.updateSagittalCanvas.subscribe(
			this.publishers.onAxialChange
		);
		this.listeners.updateAxialCanvas.subscribe(
			this.publishers.onAxialChange
		);
		this.listeners.updateCoronalCanvas.subscribe(
			this.publishers.onAxialChange
		);
		
		this.listeners.updateSagittalCanvas.subscribe(
			this.publishers.onCoronalChange
		);
		this.listeners.updateAxialCanvas.subscribe(
			this.publishers.onCoronalChange
		);
		this.listeners.updateCoronalCanvas.subscribe(
			this.publishers.onCoronalChange
		);
		
		this.listeners.updateSagittalCanvas.subscribe(
			this.publishers.onSagittalChange
		);
		this.listeners.updateAxialCanvas.subscribe(
			this.publishers.onSagittalChange
		);
		this.listeners.updateCoronalCanvas.subscribe(
			this.publishers.onSagittalChange
		);
		
		
		
		this.listeners.updateTextDisplay.subscribe(
			this.publishers.onCrosshairChange
		);
		this.listeners.updateThresholds.subscribe(
			this.publishers.onThresholdChange
		);
		
		this.listeners.clearRenderedSlices.subscribe(
			this.publishers.localStorageCleared
		);
	
		
		//sets the click handling bindings
		// reference the function header for more info
		this.setEventBindings();
		
		if(thresholds.value == null){
			thresholds.value = this.brainImage.getMin();
		}
		
		/*
		 * build the threshold slider, including its event bindings and click
		 * behavior. 
		 */
		$(thresholds.slider).slider({max: this.brainImage.getMax(),
			min : this.brainImage.getMin(),
			value : thresholds.value,
			orientation: thresholds.orientation
		}).bind('slide', {
			coronalRenderer : this.renderers.coronalRenderer,
			onThresholdChange : this.publishers.onThresholdChange,
			brainImage : this.brainImage
		},
			function(event, ui){
				currentThreshold = event.data.coronalRenderer.getThreshold();
				range = currentThreshold - ui.value;
				range = Math.abs(range);
				scale = Math.abs(event.data.brainImage.getMax() -
					event.data.brainImage.getMin());
				if(range/scale > .1){
					//if there is more than a 10% change in the threshold,
					//rerender with the new value to give the illusion of 
					//responsiveness 
					event.data.onThresholdChange.deliver(ui.value);
				}
		}).bind('slidechange',
			{
				onThresholdChange: this.publishers.onThresholdChange
			},
			function(event, ui){
				event.data.onThresholdChange.deliver(ui.value);
			} 
		);
		
		//prevents this function from being called twice and royally screwing
		//things up
		this.instantiated = true;
		
	},
	
	constants : {
		//the data we have is in 60x72x60 rez, but the system is pretending that
		//it is in 90x109x90 rez. The multiplier fixes the X, Y, and Z coords
		//that are reported to the higher rez.
		coordinateMultiplier : 1.5, 
		//these are the dimensions of the original file.
		//@TODO - these need to be removed and replaced with a system that 
		//detects the dimensionality automatically
		smallDimension : 91,
		largeDimension : 109
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
		localStorageCleared : new Publisher()
	},
	
	/*
	 * listening functions that sort out the data delivered from 
	 * the publishers
	 */
	listeners : {
		
		
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
		},
		
		updateSagittalCanvas : function(data){
			/*
			 * data.sagittalSlice
			 * 	.axialSlice
			 * 	.coronalSlice
			 * 	.coordinateX
			 * 	.coordinateY
			 *  .canvasChange
			 */
			var xCoord, yCoord;
			
			switch(data.canvasChange){
				case 'coronal':
					xCoord = viewer.renderers.coronalRenderer.getLastSlice() *
						viewer.renderers.coronalRenderer.pixelSize;
					yCoord = data.coordinateY;
					break;
				case 'sagittal':
					xCoord = data.coordinateX;
					yCoord = data.coordinateY;
					break;
				case 'axial':
					xCoord = data.coordinateX;
					yCoord = viewer.renderers.axialRenderer.getLastSlice() *
						viewer.renderers.axialRenderer.pixelSize;
					break;
			}
			/*
			 * every child of 'renderer' has a 'renderingComplete' callback 
			 * function that is triggered when it is done rendering the current
			 * view. To ensure that the background is drawn first, then the 
			 * heatmap, then the crosshairs, we attach the render function for 
			 * the next step as the renderingComplete callback for the previous
			 * step. This technique is replicated in each of the update__Canvas
			 * functions.
			 */
			viewer.renderers.sagittalBackgroundRenderer.renderingComplete = function(){
				viewer.renderers.sagittalRenderer.render(data.sagittalSlice);
			};
			viewer.renderers.sagittalRenderer.renderingComplete = function() {
				viewer.renderers.sagittalCrosshairs.render(xCoord,yCoord);
			};
			
			viewer.renderers.sagittalBackgroundRenderer.render(data.sagittalSlice);

		},
		
		updateCoronalCanvas : function(data){
			/*
			 * data.sagittalSlice
			 * 	.axialSlice
			 * 	.coronalSlice
			 * 	.coordinateX
			 * 	.coordinateY
			 * 	.canvasChange
			 */
			 
			var xCoord, yCoord;
			
			switch(data.canvasChange){
				case 'coronal':
					xCoord = data.coordinateX;
					yCoord = data.coordinateY;
					break;
				case 'sagittal':
					xCoord = viewer.renderers.sagittalRenderer.getLastSlice() *
						viewer.renderers.sagittalRenderer.pixelSize;
					yCoord = data.coordinateY;
					break;
				case 'axial':
					xCoord = data.coordinateY;
					yCoord = viewer.renderers.axialRenderer.getLastSlice() *
						viewer.renderers.axialRenderer.pixelSize;
					break;
			}
			 
			viewer.renderers.coronalBackgroundRenderer.renderingComplete = function(){
				viewer.renderers.coronalRenderer.render(data.coronalSlice);
			};
			viewer.renderers.coronalRenderer.renderingComplete = function() {
				viewer.renderers.coronalCrosshairs.render(xCoord,yCoord);
			};
			
			viewer.renderers.coronalBackgroundRenderer.render(data.coronalSlice);

		},
		
		updateAxialCanvas : function(data){
			/*
			 * data.sagittalSlice
			 * 	.axialSlice
			 * 	.coronalSlice
			 * 	.coordinateX
			 * 	.coordinateY
			 * 	.canvasChange
			 */
			var xCoord, yCoord;
			
			switch(data.canvasChange){
				case 'coronal':
					xCoord = viewer.renderers.coronalRenderer.getLastSlice() * 
						viewer.renderers.coronalRenderer.pixelSize;
					yCoord = data.coordinateX;
					break;
				case 'sagittal':
					xCoord = data.coordinateX;
					yCoord = viewer.renderers.sagittalRenderer.getLastSlice() *
						viewer.renderers.sagittalRenderer.pixelSize;
					break;
				case 'axial':
					xCoord = data.coordinateX;
					yCoord = data.coordinateY;
					break;
			}
			
			viewer.renderers.axialBackgroundRenderer.renderingComplete = function(){
				viewer.renderers.axialRenderer.render(data.axialSlice);
			};
			viewer.renderers.axialRenderer.renderingComplete = function() {
				viewer.renderers.axialCrosshairs.render(xCoord,yCoord);
			};
			
			viewer.renderers.axialBackgroundRenderer.render(data.axialSlice);
		},
		
		clearRenderedSlices : function(){
			viewer.renderers.coronalRenderer.renderedSlices = [];
			viewer.renderers.sagittalRenderer.renderedSlices = [];
			viewer.renderers.axialRenderer.renderedSlices = [];
		}
	},
	
	/*
	 * the actual canvas objects to draw on
	 */
	canvases : {
		coronalCanvas : null,
		sagittalCanvas : null,
		axialCanvas : null
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
	 * Each renderer must implement the 'render' interface or the app will 
	 * throw a fatal error
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
		axialBackgroundRenderer : null
	},
	
	/*
	 * the cache objects stubs
	 * these all get set in this.init based on what is passed in to 'init'
	 */
	caches: {
		coronalCache : null,
		sagittalCache : null,
		axialCache : null
	},
	
	/*
	 * objects that we'll be writing text data into
	 */
	textOutput : {
		coordinateObject : null,
		voxelObject : null,
		urlObject : null,
		thresholdObject: null
	},
	
	/*
	 * current slider threshold. any pixels that contain a value lower than 
	 * the current value of threshold will not be rendered
	 */
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
				publishers : viewer.publishers
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
				
				/*
				 * deliver the data object since the crosshairs are going to 
				 * change
				 */
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
					viewer.threshold
				});
			
				/*
				 * this resets each of the canvases so that we have a clean
				 * canvas to draw the new images on
				 */
				event.data.canvases.coronalCanvas.width = 
					event.data.canvases.coronalCanvas.width;
				event.data.canvases.sagittalCanvas.width = 
					event.data.canvases.sagittalCanvas.width;
				event.data.canvases.axialCanvas.width = 
					event.data.canvases.axialCanvas.width;
				
				/*
				 * We're delivering a lot of data here, much of which is not 
				 * actually used, but could be useful down the road.
				 */
				event.data.publishers.onCoronalChange.deliver({
					canvasChange : 'coronal',
					sagittalSlice : Math.floor(sagSlice),
					axialSlice : Math.floor(axSlice),
					coronalSlice : event.data.coronalRenderer.getLastSlice(),
					coordinateX : relativeX,
					coordinateY : relativeY
				});
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
				publishers : viewer.publishers
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
					viewer.threshold
				});

				event.data.canvases.coronalCanvas.width = 
					event.data.canvases.coronalCanvas.width;
				event.data.canvases.sagittalCanvas.width = 
					event.data.canvases.sagittalCanvas.width;
				event.data.canvases.axialCanvas.width = 
					event.data.canvases.axialCanvas.width;
				
			
				
				event.data.publishers.onSagittalChange.deliver({
					canvasChange : 'sagittal',
					sagittalSlice : event.data.sagittalRenderer.getLastSlice(),
					axialSlice : Math.floor(axSlice),
					coronalSlice : Math.floor(corSlice),
					coordinateX : relativeX,
					coordinateY : relativeY
				});
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
				publishers : viewer.publishers
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
					viewer.threshold
				});
	
				event.data.canvases.coronalCanvas.width = 
					event.data.canvases.coronalCanvas.width;
				event.data.canvases.sagittalCanvas.width = 
					event.data.canvases.sagittalCanvas.width;
				event.data.canvases.axialCanvas.width = 
					event.data.canvases.axialCanvas.width;
				
				event.data.publishers.onAxialChange.deliver({
					canvasChange : 'axial',
					sagittalSlice : Math.floor(sagSlice),
					axialSlice : event.data.axialRenderer.getLastSlice(),
					coronalSlice : Math.floor(corSlice),
					coordinateX : relativeX,
					coordinateY : relativeY
				});
			}
		);
	},
	
	/*
	 * Namespace for static functions/helper functions
	 */
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
				relativeX = event.pageX - Math.floor(offset.left) - 1;
				relativeY = event.pageY - Math.floor(offset.top) - 1;
			}
			return {'relativeX' : relativeX, 'relativeY' : relativeY};
		},
		
		rerenderAll : function() {
			clickEvent = $.Event('click');
			clickEvent.relativeX = viewer.renderers.sagittalCrosshairs.getLastX();
			clickEvent.relativeY = viewer.renderers.sagittalCrosshairs.getLastY();
			$(viewer.canvases.sagittalCanvas).trigger(clickEvent);
		}
	}
};
