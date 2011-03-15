/*
 * these aren't accurate as I don't actually know the difference between
 * the anatomical orientations.
 */

var brainImage = {
	data : null,
	getCoronalData: function(index){
		if(brainImage.data == null){
			throw('brainImage data is not set');
		}
		if(index >= brainImage.data.length){
			throw ('Slice out of bounds error. Asked to render '+index
				+' but only have '+brainImage.data.length
				+' slices in Coronal Data');
		}
		
		return brainImage.data[index];
	},
	getSagittalData: function(index){
		if(brainImage.data == null){
			throw('brainImage data is not set');
		}
		if(index >= brainImage.data[0].length){
			throw ('Slice out of bounds error. Asked to render '+index
				+' but only have '+brainImage.data[0].length
				+' slices in Sagittal Data');
		}
		
		var sagittalSlice = [];
		var sagittalRow = [];
		
		for(var i = 0; i < brainImage.data.length; i++){
			sagittalRow = [];
			for(var j = 0; j < brainImage.data[i][index].length; j++){
				sagittalRow.push(brainImage.data[i][index][j]);
			}
			sagittalSlice.push(sagittalRow);
		}
		
		return sagittalSlice;
	},
	getAxialData: function(index){
		if(brainImage.data == null){
			throw('brainImage data is not set');
		}
		if(index >= brainImage.data[0][0].length){
			throw ('Slice out of bounds error. Asked to render '+index
				+' but only have '+brainImage.data[0][0].length
				+' slices in Axial Data');
		}
		
		var axialSlice = [];
		var axialRow = [];
		
		for(var i = 0; i < brainImage.data.length; i++){
			axialRow = [];
			for(var j = 0; j < brainImage.data[i].length; j++){
				axialRow.push(brainImage.data[i][j][index]);
			}
			axialSlice.push(axialRow);
		}
		
		return axialSlice;
	}
};
