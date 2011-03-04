/*
 * renders crosshairs on a canvas 
 * 
 * after creating an object, you need only call object.render(x,y)
 * with (x,y) being the ordered pair that the crosshairs will 
 * intersect
 * 
 * this object provides some helper functions such as getLineWidth,
 * getLineColor, getLastX, and getLastY. The "last" functions return
 * the previously rendered coords.
 * 
 * @param canvasObject - an html canvas
 * @param lineWidth - the width of the crosshairs line in px
 * @param lineColor - a css string describing the crosshair color
 * @param renderingCompleteCallback - a callback to execute after 
 * 										rendering has finished
 */
function crosshairsRenderer(canvasObject, lineWidth, lineColor, 
								renderingCompleteCallback){ //implements Renderer
	
	//extend the canvasRenderer class
	canvasRenderer.apply(this,[canvasObject, renderingCompleteCallback]);
	
	var myLineWidth = lineWidth;
	var myLineColor = lineColor;
	
	this.getLineWidth = function(){
		return myLineWidth;
	};
	
	this.getLineColor = function (){
		return myLineColor;
	};
	
	var lastX = null;
	var lastY = null;
	
	this.getLastX = function(){
		return lastX;
	};
	
	this.getLastY = function(){
		return lastY;
	};
	
	this.render = function(canvasX, canvasY){
		
		if(typeof canvasX === 'object'){
			canvasY = canvasX[1];
			canvasX = canvasX[0];
		}
		
		this.context.beginPath();
		
		for(var i = 0; i < this.getLineWidth(); i++){
			this.context.moveTo(canvasX + i, 0);
			this.context.lineTo(canvasX + i, this.getCanvasHeight());
			this.context.moveTo(0,canvasY + i);
			this.context.lineTo(this.getCanvasWidth(), canvasY + i);
		}
		
		
		this.context.strokeStyle = this.getLineColor();
		this.context.stroke();
		this.context.closePath();
		
		lastX = canvasX;
		lastY = canvasY;
		
		if(this.renderingComplete != null &&
			 typeof this.renderingComplete === 'function'){
			this.renderingComplete(this);
		}

	};
}
