
var viewer = {
	
	/*
	 * functions that publish data for events
	 */
	publishers : {
		onCoronalChange : new Publisher(),
		onSagittalChange : new Publisher(),
		onAxialChange : new Publisher(),
		onCoronalRenderingComplete : new Publisher(),
		onSagittalRenderingComplete : new Publisher(),
		onAxialRenderingComplete : new Publisher(),
	},
	
	/*
	 * listening functions that sort out the data delivered from 
	 * the publishers
	 */
	listeners : {
		
		/*
		 * Takes in a list of renderingGroups and calls displaySlice on the
		 * renderer in each group with the slice number provided in the group
		 * 
		 * @param renderingGroups - takes a list of objects, each should 
		 * 							contain the members slice, renderer, and weight.
		 * 							Slice is the slice to render, renderer is 
		 * 							the renderer to dispatch to, and weight is
		 * 							the order to render in (heavier items render
		 * 							later than lighter items)
		 */
		dispatchRenderingData : function(renderingGroups) {
			if(renderingGroups == null){
				throw ('dispatch called with no arguments');
				return;
			}
			if(renderingGroups.length == 0){
				throw('no renderer to dispatch to');
				return;
			}
			for(var i = 0; i < renderingGroups.length; i++){
				if(renderingGroups[i].renderArgs == undefined ){
					throw('attempting to dispatch renderer number '+i
					+' with no slice');	
				}
				if(renderingGroups[i].renderer == undefined){
					throw('attempting to dispatch renderer number '+i
					+' with no renderer');
				}
				if(renderingGroups[i].weight == undefined){
					throw('attempting to dispatch renderer number '+i
					+' with no weight')
				}
			}
			
			renderingGroups.sort(function(a,b){
				if(a.weight > b.weight){
					return 1;
				}
				if(a.weight < b.weight){
					return -1;
				}
				return 0;
			});
			
			for (var i = 0; i < renderingGroups.length; i++){
				renderingGroups[i].renderer.render(
					renderingGroups[i].renderArgs
				);
			}

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
	brainImage : null,
	
	/*
	 * the background that will be displayed
	 */
	brainBackground : null,

	/*
	 * the renderers that will display the data
	 * these need to be instantiated after the data has been loaded.
	 */
	renderers : {
		coronalRenderer : null,
		sagittalRenderer : null,
		axialRenderer : null,
		coronalCrosshairs : null,
		sagittalCrosshairs : null,
		axialCrosshairs : null,
	},
	
};
