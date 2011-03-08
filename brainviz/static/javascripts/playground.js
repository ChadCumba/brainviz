function drawStuff(){
	var data = loadJsonDataFromLocation('/image/getdata');
	
	var mycanvas = $('#coronal')[0];
	var mycontext = mycanvas.getContext('2d');
	
	for (var i =0; i < data[30].length; i++){
		for (var j = 0; j < data[30][i].length; j++){
			
			var shade = (data[30][i][j] + 2000) * .064;
			shade = Math.floor(shade);
			
			mycontext.fillStyle = "rgb("+shade+","+shade+","+shade+")";
			
			if(data[30][i][j] != 0){
				mycontext.fillRect(i*4,j*4,4,4);
			}
		}
	}
}

function render2dMatrixToContext(matrix,contextObject, pixelSize,fillCallback ){
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
	
}

function greyScaleFill( pixelValue){
	var shade = (pixelValue + 2000) * .064;
	shade = Math.floor(shade);
			
	return "rgb("+shade+","+shade+","+shade+")";
			
}

