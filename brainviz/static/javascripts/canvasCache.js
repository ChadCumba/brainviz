/**
 * @author Chad Cumba
 */

function canvasCache(canvasObject, storageCallback, retrievalCallback){
	
	if(canvasObject.getContext == undefined){
		throw "First argument must be a <canvas> element";
	}
	
	if(storageCallback == null || typeof storageCallback != 'function'){
		throw "StorageCallback must be a function that takes two paramaters:"
			+" a key that is a string, and a value that is arbitrary data";
	}
	
	if(retrievalCallback == null || typeof retrievalCallback != 'function'){
		throw "RetrievalCallback must be a function that takes one paramater "
			+"that is a string that is a key, and should return either the data"
			+" or throw a key not found error";
	}
	
	var canvas = canvasObject;
	var store = storageCallback;
	var retrieve = retrievalCallback;
	
	var keys = [];
	
	var generateKey = function(canvasId, imageIndex){
		var sitePath = window.location.pathname;
		return sitePath +'%%' + canvasId + '%%' + imageIndex;
	}
	
	this.cacheCurrent = function(){
		var value = canvas.toDataURL();
		
		var keyNumber = keys.length;
		keys.push(keyNumber);
		
		var key = generateKey($(canvas).attr('id'), keyNumber);
		return store.apply(this,[key,value]);
	};
	
	this.getByKey = function(key){
		return retrieve.apply(this,[key]);
	};
	
}
