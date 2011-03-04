/*
 * This class holds the brain data and provides accessor functions
 * @param data - a 3d matrix of arbitrary size that contains brain data.
 * 				must be a cube.
 * @param max - the largest value in the matrix
 * @param min - the smallest value in the matrix
 * 
 * provides five accessor functions:
 * getMax - returns the largest item in the matrix
 * getMin - returns the smallest item in the matrix
 * getCoronalData(index) - returns the coronal slice for the index given,
 * 							throws index out of bounds error
 * getSagittalData(index) - returns the sagittal slice for the index
 * getAxialData(index) - returns the axial slice for the index
 */
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
		
		/*
		 * retuns a 2d matrix of the data 
		 * note that this is a shallow copy, and alterations to the returned
		 * value will alter the underlying 3d matrix
		 * @param index - an int ranging from 0 to data.length - 1
		 */
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
