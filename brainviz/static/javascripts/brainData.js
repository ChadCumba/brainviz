function brainData(data){
	
		this.data = data;
		
		this.getCoronalData = function(index){
				if(viewer.brainImage.data == null){
					throw('brainImage data is not set');
				}
				if(index >= viewer.brainImage.data.length){
					throw ('Slice out of bounds error. Asked to render '+index
						+' but only have '+viewer.brainImage.data.length
						+' slices in Coronal Data');
				}
				
				return viewer.brainImage.data[index];
			};
		
		this.getSagittalData = function(index){
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
			};
			
		this.getAxialData = function(index){
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
		};
}
