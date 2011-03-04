/*
 * the base canvas renderer object that the other renderers 
 * are derived from. This class should not be instantiated,
 * if you did you have made a mistake.
 * @param canvasObject - an HTML dom node of 'canvas' type
 * @param renderingCompleteCallback - callback to execute once
 * 										rendering is complete
 */
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
