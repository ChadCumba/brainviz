function canvasRenderer(canvasObject, renderingCompleteCallback){ //implements Renderer
	
	this.context = canvasObject.getContext('2d');
	
	var canvasWidth = canvasObject.width;
	var canvasHeight = canvasObject.height;
	
	this.renderingComplete = null;
	if(renderingCompleteCallback != undefined){
		renderingComplete = renderingCompleteCallback;
	}
	
	this.getCanvasWidth = function(){
		return canvasWidth;
	};
	
	this.getCanvasHeight = function(){
		return canvasHeight;
	};
	
	this.render = function(){};
};
