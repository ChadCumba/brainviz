/*
 * Creates a rendering object that can display brain slices on a canvas object
 * Usage: brainOrientationRenderer.label -> returns the label
 * brainOrientationRenderer.displaySlice(int) -> displays the requested brain 
 * 	slice
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
 */
function brainOrientationRenderer(brainDataCallback, canvasObject, orientationLabel,
									 pixelSize, fillCallback){
	
	this.context = canvasObject.getContext('2d');
	
	this.getBrainData = brainDataCallback;
	
	this.label = orientationLabel;
	
	this.renderedSlices = [];
	
	this.pixelSize = pixelSize;
	
	this.fillCallback = fillCallback;
	
	function render2dMatrixToContext(matrix,contextObject, rectangleSize,
			fillStyleCallback ){
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
		
		for(var i = 0; i < matrix.length; i++){
			for(var j = 0; j < matrix[i].length; j++){
				contextObject.fillStyle = fillStyleCallback.apply(
											this,[matrix[i][j]]);
				contextObject.fillRect(i * rectangleSize, j * rectangleSize,
					rectangleSize, rectangleSize);
			}
		}
	
	};
	/*
	 * this is a precursor function to slice caching.
	 * Currently there is no caching enabled, so it does the same thing
	 * as renderSlice 
	 */
	function getSlice(sliceToRetrieve){
		render2dMatrixToContext(this.getBrainData(sliceToRetrieve), 
			this.context, this.pixelSize, this.fillCallback );
	};
	/*
	 * @param sliceToRender - int desscribing the slice to render
	 * draws the requested slice on the canvas, or throws a slice out of 
	 * bounds error
	 */
	function renderSlice(sliceToRender){
		
		render2dMatrixToContext(this.getBrainData(sliceToRender), 
			this.context, this.pixelSize, this.fillCallback )
		this.renderedSlices.push(sliceToRender);
	};
	/*
	 * displaySlice is the only function that you need to access on this object.
	 * It will find and display the slice you request.
	 * @param sliceIndex - the index of the slice to display
	 */
	this.displaySlice = function(sliceIndex){
		if($.inArray(sliceIndex, this.renderedSlices)){
			//we call this function with 'apply' as it exists as a private member
			//and thus 'this', when inside getSlice, will refer to the window
			//instead of the object. Apply overrides this behavior
			return getSlice.apply(this,[sliceIndex]);
		}else{
			//same deal as above
			renderSlice.apply(this,[sliceIndex]);
		}
	};
	

};
