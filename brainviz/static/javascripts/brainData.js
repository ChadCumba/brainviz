function brainData(data, max, min){
	
	
	
		this.data = data;
		
		
		var myMax = max;
		var myMin = min;
		
		this.getMax = function(){
			return myMax;
		};
		
		this.getMin = function(){
			return myMin;
		};
		
		this.getCoronalData = function(index){
				if(this.data === null){
					throw('brainImage data is not set');
				}
				if(index >= this.data.length){
					throw ('Slice out of bounds error. Asked to render '+index
						+' but only have '+this.data.length
						+' slices in Coronal Data');
				}
				
				return this.data[index];
			};
		
		this.getSagittalData = function(index){
				if(this.data === null){
					throw('brainImage data is not set');
				}
				if(index >= this.data[0].length){
					throw ('Slice out of bounds error. Asked to render '+index
						+' but only have '+this.data[0].length
						+' slices in Sagittal Data');
				}
				
				var sagittalSlice = [];
				var sagittalRow = [];
				var i;
				var j;
				for( i = 0; i < this.data.length; i++){
					sagittalRow = [];
					for(j = 0; j < this.data[i][index].length; j++){
						sagittalRow.push(this.data[i][index][j]);
					}
					sagittalSlice.push(sagittalRow);
				}
				
				return sagittalSlice;
			};
			
		this.getAxialData = function(index){
			if(this.data === null){
				throw('brainImage data is not set');
			}
			if(index >= this.data[0][0].length){
				throw ('Slice out of bounds error. Asked to render '+index
					+' but only have '+this.data[0][0].length
					+' slices in Axial Data');
			}
			
			var axialSlice = [];
			var axialRow = [];
			var i;
			var j;
			
			for( i = 0; i < this.data.length; i++){
				axialRow = [];
				for(j = 0; j < this.data[i].length; j++){
					axialRow.push(this.data[i][j][index]);
				}
				axialSlice.push(axialRow);
			}
			
			return axialSlice;
		};
}
