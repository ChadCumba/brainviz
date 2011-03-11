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

function makeBackgrounds(){
	
	for(var i =0; i < 60; i++){
		viewer.renderers.coronalBackgroundRenderer.render(i);
		viewer.renderers.axialBackgroundRenderer.render(i);
		viewer.renderers.sagittalBackgroundRenderer.render(i);
        viewer.renderers.sagittalRenderer.render(i);
        viewer.renderers.coronalRenderer.render(i);
        viewer.renderers.axialRenderer.render(i);
        data_string = viewer.canvases.sagittalCanvas.toDataURL();
        $.ajax({
            async: false,
            global: false,
            url: 'http://localhost:8000/image/save',
            cache: false,
            type: 'POST',
            data: {'image_string' : data_string,
                     'image_name': 'sagittal' + i+'.png'
            }
        });
        data_string = viewer.canvases.coronalCanvas.toDataURL();
        $.ajax({
            async: false,
            global: false,
            url: 'http://localhost:8000/image/save',
            cache: false,
            type: 'POST',
            data: {'image_string' : data_string,
                     'image_name': 'coronal' + i+'.png'
            }
        });
        data_string = viewer.canvases.axialCanvas.toDataURL();
        $.ajax({
            async: false,
            global: false,
            url: 'http://localhost:8000/image/save',
            cache: false,
            type: 'POST',
            data: {'image_string' : data_string,
                     'image_name': 'axial' + i+'.png'
            }
        });
	}
	
	for(var i = 60; i < 72; i++){
		viewer.renderers.sagittalBackgroundRenderer.render(i);
        viewer.renderers.sagittalRenderer.render(i);
        data_string = viewer.canvases.sagittalCanvas.toDataURL();
        $.ajax({
            async: false,
            global: false,
            url: 'http://localhost:8000/image/save',
            cache: false,
            type: 'POST',
            data: {'image_string' : data_string,
                     'image_name': 'sagittal' + i+'.png'
            }
        });

    }
}

