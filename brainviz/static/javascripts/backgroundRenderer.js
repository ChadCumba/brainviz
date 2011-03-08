/**
 * @author Chad Cumba
 */

function brainBackgroundImageRenderer(backgroundImages, canvasObject,
			renderingCompleteCallback, defaultBackgroundColor){
	//extend the canvasRenderer object
	canvasRenderer.apply(this,[canvasObject, renderingCompleteCallback]);
	
	
	
	this.backgroundSlices = backgroundImages;
	this.defaultBackgroundColor = defaultBackgroundColor;
	
	this.render = function(index){
		if (index < 0 || index >= this.backgroundSlices.length){
			throw('Asked to render background at index '+index+ ' but '
			+'only have '+ this.backgroundSlices.length+' to render');
		}
		if(this.backgroundSlices[index] == null){
			//render default
			//we have to do this every time as the canvas object is shared 
			//between many objects and fillStyle can change from call to call
			this.context.fillStyle = this.defaultBackgroundColor;
			
			this.context.fillRect(0,0,this.getCanvasWidth(),
				this.getCanvasHeight());
		}else{
			//render image
			this.context.drawImage(this.backgroundSlices[index], 0, 0,
				this.getCanvasWidth(), this.getCanvasHeight());
		}
		
		if(typeof(this.renderingComplete) == 'function'){
			this.renderingComplete.apply(this);
		}
		
	};
}
