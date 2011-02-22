function brainOrientationRenderer(brainData, canvasObject, orientationLabel, pixelSize,
									fillCallback){
	
	this.context = canvasObject.getContext('2d');
	
	this.brainData = brainData;
	
	this.label = orientationLabel;
	
	this.renderedSlices = [];
	
	this.pixelSize = pixelSize;
	
	this.fillCallback = fillCallback;
	
	this.render2dMatrixToContext = function(matrix,contextObject, rectangleSize,
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
		if(pixelSize == undefined){
			pixelSize = 1;
		}
		//with no fillStyleCallback defined, we give black for all pixels
		if(fillCallback == undefined){
			fillCallback = function(){
				return "rgb(0,0,0)";
			}
		}
		
		for(var i = 0; i < matrix.length; i++){
			for(var j = 0; j < matrix[i].length; j++){
				contextObject.fillStyle = fillCallback.apply(this,[matrix[i][j]]);
				contextObject.fillRect(i * pixelSize, j * pixelSize, pixelSize,
					pixelSize);
			}
		}
	
	};
	
	this.displaySlice = function(sliceToRetrieve){
		this.render2dMatrixToContext(this.brainData[sliceToRetrieve], 
			this.context, this.pixelSize, this.fillCallback );
	}
	
	this.renderSlice = function(sliceToRender){
		if(sliceToRender >= this.brainData.length){
			throw ('Slice out of bounds error. Asked to render '+sliceToRender
				+' but only have '+this.brainData.length+' slices in renderer '
				+this.label);
		}
		
		if($.inArray(sliceToRender, this.renderedSlices)){
			return this.displaySlice(sliceToRender);
		}
		else{
			this.render2dMatrixToContext(this.brainData[sliceToRender], 
				this.context, this.pixelSize, this.fillCallback )
			this.renderedSlices.push(sliceToRender);
		}
		
		
	}
	

};
