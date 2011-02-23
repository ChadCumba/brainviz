var viewer = {
	
	/*
	 * functions that publish data for events
	 */
	publishers : {
		onCoronalClick : new Publisher(),
		onSagittalClick : new Publisher(),
		onAxialClick : new Publisher(),
	},
	
	/*
	 * listening functions that sort out the data delivered from 
	 * the publishers
	 */
	listeners : {
		dispatchSagittalData : function(eventdata) {
			if(eventdata == null){
				throw ('dispatch called with no arguments');
				return;
			}
			if(eventdata.sagittalRenderer == null){
				throw('no renderer to dispatch to');
				return;
			}
			if(eventdata.sagittalSlice == null){
				throw('no slice to render');
				return;
			}
			eventdata.sagittalRenderer.displaySlice(
				Math.floor(eventdata.sagittalSlice)
			);
		},
		dispatchCoronalData : function(eventdata) {
			if(eventdata == null){
				throw ('dispatch called with no arguments');
				return;
			}
			if(eventdata.coronalRenderer == null){
				throw('no renderer to dispatch to');
				return;
			}
			if(eventdata.coronalSlice == null){
				throw('no slice to render');
				return;
			}
			eventdata.coronalRenderer.displaySlice(
				Math.floor(eventdata.coronalSlice)
			);
		},
		dispatchAxialData : function(eventdata) {
			if(eventdata == null){
				throw ('dispatch called with no arguments');
				return;
			}
			if(eventdata.axialRenderer == null){
				throw('no renderer to dispatch to');
				return;
			}
			if(eventdata.axialSlice == null){
				throw('no slice to render');
				return;
			}
			eventdata.axialRenderer.displaySlice(
				Math.floor(eventdata.axialSlice)
			);
		},
	},
	
	/*
	 * the actual canvas objects to draw on
	 */
	canvases : {
		coronalCanvas : null,
		sagittalCanvas : null,
		axialCanvas : null,
	},
	
	/*
	 * the image data that will be displayed
	 */
	brainImage : {
		data : null,
		getCoronalData: function(index){
			if(viewer.brainImage.data == null){
				throw('brainImage data is not set');
			}
			if(index >= viewer.brainImage.data.length){
				throw ('Slice out of bounds error. Asked to render '+index
					+' but only have '+viewer.brainImage.data.length
					+' slices in Coronal Data');
			}
			
			return viewer.brainImage.data[index];
		},
		getSagittalData: function(index){
			if(viewer.brainImage.data == null){
				throw('brainImage data is not set');
			}
			if(index >= viewer.brainImage.data[0].length){
				throw ('Slice out of bounds error. Asked to render '+index
					+' but only have '+viewer.brainImage.data[0].length
					+' slices in Sagittal Data');
			}
			
			var sagittalSlice = [];
			var sagittalRow = [];
			
			for(var i = 0; i < viewer.brainImage.data.length; i++){
				sagittalRow = [];
				for(var j = 0; j < viewer.brainImage.data[i][index].length; j++){
					sagittalRow.push(viewer.brainImage.data[i][index][j]);
				}
				sagittalSlice.push(sagittalRow);
			}
			
			return sagittalSlice;
		},
		getAxialData: function(index){
			if(viewer.brainImage.data == null){
				throw('brainImage data is not set');
			}
			if(index >= viewer.brainImage.data[0][0].length){
				throw ('Slice out of bounds error. Asked to render '+index
					+' but only have '+viewer.brainImage.data[0][0].length
					+' slices in Axial Data');
			}
			
			var axialSlice = [];
			var axialRow = [];
			
			for(var i = 0; i < viewer.brainImage.data.length; i++){
				axialRow = [];
				for(var j = 0; j < viewer.brainImage.data[i].length; j++){
					axialRow.push(viewer.brainImage.data[i][j][index]);
				}
				axialSlice.push(axialRow);
			}
			
			return axialSlice;
		},
	},

	/*
	 * the renderers that will display the data
	 * these need to be instantiated after the data has been loaded.
	 */
	renderers : {
		coronalRenderer : null,
		sagittalRenderer : null,
		axialRenderer : null,
	},
};
