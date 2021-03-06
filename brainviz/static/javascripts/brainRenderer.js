/*
 * Creates a rendering object that can display brain slices on a canvas object
 * Usage: brainOrientationRenderer.label -> returns the label
 * brainOrientationRenderer.displaySlice(int) -> displays the requested brain 
 * 	slice
 * @param brainDataObject - a pointer to the object that the brain data is stored
 * 							in. this is necessary as we invoke the data callback 
 * 							via callback.apply(brainDataObject,[args])
 * @param brainDataCallback - function that takes a single int argument, returns 
 * 								a 2d matrix that represents the slice
 * @param canvasObject - raw dom canvas object to draw on
 * @param orientationLabel - string describing the orientation
 * @param pixelSize - the size of the pixels that you wish to render
 * @param fillCallBack - function that takes a single floating point argument
 * 							and returns a CSS color string. The callback will 
 * 							always be called with a single point of data from
 * 							the matrix provided by brainDataCallback, as such
 * 							fillCallBack will determine the color/shading of
 * 							each individual pixel.
 * @param renderingCompleteCallback - function that is invoked after rendering
 * 										is complete.
 */
function brainOrientationRenderer(brainDataObject, brainDataCallback, canvasObject, orientationLabel,
									 pixelSize, fillCallback,renderingCompleteCallback, cacheObject){
	//implements Renderer
	
	//extend the renderer class
	canvasRenderer.apply(this,[canvasObject, renderingCompleteCallback]);
	
	/*
	 * we store both the brainObject and brainDataCallback so that we can call
	 * the getBrainData callback like this:
	 * this.getBrainData.apply(this.brainObject,[index]);
	 * this allows us to call an arbitrary function, using the scope of the brain
	 * object we are passed. If we just call this.getBrainData(index) then 
	 * getBrainData will be unable to access members of its class.
	 */
	this.brainObject = brainDataObject;
	
	/*
	 * callback function that should return a 2d matrix of data
	 */
	this.getBrainData = brainDataCallback;
	
	this.label = orientationLabel;
	
	this.renderedSlices = [];
	
	this.pixelSize = pixelSize;
	
	this.fillCallback = fillCallback;
	
	var cache = cacheObject;
	
	var lastSlice = null;
	
	var threshold = null;
	
	this.getLastSlice = function(){
		return lastSlice;
	}
	
	this.getThreshold = function(){
		return threshold;
	}
	
	this.setThreshold = function(newThreshold){
		threshold = newThreshold;
	}
	
	/*
	 * internal use only
	 * this actually draws a 2d matrix onto the canvas object
	 * @param matrix - a 2d matrix of data points
	 * @param contextObject - a 2d drawing context
	 * @param rectangleSize - int, the size of the pixels to draw (in px)
	 * @param fillStyleCallback - callback function that takes a pixel value
	 * 								and returns a css color
	 * @param threshold - a value such that all pixels <= threshold are not
	 * 						rendered.
	 */
	function render2dMatrixToContext(matrix,contextObject, rectangleSize,
			fillStyleCallback, threshold){
		if (matrix[0].length == undefined ){
			throw('First arg must be 2 dimensional matrix');
			return;
		}
		if(matrix[0][0].length != undefined){
			throw('First arg must be 2 dimensional matrix');
			return;
		}
		//weak typing here
		if(contextObject.fillRect == undefined || 
			contextObject.fillStyle == undefined){
			
			throw('Second argument must respond to fillRect and fillStyle');
			return;	
		}
		if(rectangleSize == undefined){
			rectangleSize = 1;
		}
		//with no fillStyleCallback defined, we give greyscale for all pixels
		if(fillStyleCallback == undefined){
			fillStyleCallback = function(pixel){
				
				var shade = (pixel + 2000) * .064;
				shade = Math.floor(shade);
			
				return "rgb("+shade+","+shade+","+shade+")";
			}
		}
		if(threshold == undefined){
			threshold = -Infinity
		}
		
				
		for(var i = 0; i < matrix.length; i++){
			
			for(var j = 0; j < matrix[i].length; j++){
				//default color is black. since our 2 major slow points in this
				//function are the fillStyleCallback and the fillRect call
				//this eliminates calling anything that's close to zero, speeding
				//up the loop by about 60ms on average.
				if( (matrix[i][j] < 1 && matrix[i][j] > -1) || 
					matrix[i][j] < threshold){
					continue;
				}
				contextObject.fillStyle = fillStyleCallback.apply(
											this,[matrix[i][j]]);
				contextObject.fillRect(i * rectangleSize, 
					j * rectangleSize,
					rectangleSize, rectangleSize);
			}
		}
	
	};
	/*
	 * this is a precursor function to slice caching.
	 * Currently there is no caching enabled, so it does the same thing
	 * as renderSlice 
	 */
	function getSlice(thresholdKey,sliceToRetrieve, imageLoadedCallback){
		
		/*
		 * CSS ID's can't have periods. thresholdKey may be a floating point
		 * thus we remove the periods from it just in case
		 */
		thresholdKeyNoPeriods = ''+thresholdKey;
		thresholdKeyNoPeriods = thresholdKeyNoPeriods.replace('.','');
		
		//if the image we're looking for is already in the DOM, serve it
		if($('#'+this.label  + thresholdKeyNoPeriods  + sliceToRetrieve).length === 1){
			
			$('#'+this.label  + thresholdKeyNoPeriods  + sliceToRetrieve).one(
				'load',{that:this, image:$('#'+this.label  + thresholdKeyNoPeriods  + sliceToRetrieve)[0] },
				imageLoadedCallback).triggerHandler('load');
			
			return $('#'+this.label  + thresholdKeyNoPeriods  + sliceToRetrieve)[0];
		}

		//at this point we're sure its not in the DOM, so we'll have to pull it 
		//from the cache, create it, and attach it to the DOM.
		var imgElement = document.createElement('img');
		
		if(this.renderedSlices[thresholdKey] != undefined && cache != null){
			imgElement.src = cache.getByKey(
				this.renderedSlices[thresholdKey][sliceToRetrieve]
			);
		}
		
		imgElement.id = this.label + thresholdKeyNoPeriods + sliceToRetrieve;
		
		$(imgElement).one('load', {that: this, image:imgElement},
			imageLoadedCallback).hide();
		
		$('body').append(imgElement);
		return imgElement;
	};
	/*
	 * @param sliceToRender - int desscribing the slice to render
	 * draws the requested slice on the canvas, or throws a slice out of 
	 * bounds error
	 */
	function renderSlice(sliceToRender){
		
		render2dMatrixToContext.apply(this,
			[this.getBrainData.apply(this.brainObject, [sliceToRender]), 
			this.context, this.pixelSize, this.fillCallback, threshold]);
		
		if(this.renderedSlices[threshold] == undefined){
			this.renderedSlices[threshold] = [];
		}
		
		if(cache !== null){
			this.renderedSlices[threshold][sliceToRender] = cache.cacheCurrent();
		}
		
		
		if(this.renderingComplete != null &&
			 typeof this.renderingComplete === 'function'){
			this.renderingComplete(this);
		}
	};
	/*
	 * displaySlice is the only function that you need to access on this object.
	 * It will find and display the slice you request.
	 * @param sliceIndex - the index of the slice to display
	 */
	this.displaySlice = function(sliceIndex){
		
		var thresholdKey;
		
		if(threshold == null){
			thresholdKey = 'null';
		}else{
			thresholdKey = threshold;
		}
		
		if(this.renderedSlices[thresholdKey] != undefined && cache !== null ){
			
			if( this.renderedSlices[thresholdKey][sliceIndex] !== undefined){
				
				if( this.renderedSlices[thresholdKey][sliceIndex] !== null){
				//if the rendered slice section is defined and it is not null
				//then we have rendered it before and thus can call it back to
				//be loaded.
					imgLoadedCallback = function(event){
						event.data.that.context.drawImage(event.data.image,0,0,
							event.data.that.getCanvasWidth(),
							event.data.that.getCanvasHeight());
						if(event.data.that.renderingComplete != null &&
							typeof event.data.that.renderingComplete === 'function'){
							event.data.that.renderingComplete(event.data.that);
						}
					};
				
				//we call this function with 'apply' as it exists as a private member
				//and thus 'this', when inside getSlice, will refer to the window
				//instead of the object. Apply overrides this behavior
					var imgElement = getSlice.apply(this,[thresholdKey,sliceIndex,
						imgLoadedCallback]);
				}
				
				
				
			}else{
				renderSlice.apply(this,[sliceIndex]);
			}
			
		}else{
			//same deal as above
			renderSlice.apply(this,[sliceIndex]);
		}
		
		lastSlice = sliceIndex;

	};
	
	this.render = this.displaySlice;

};
