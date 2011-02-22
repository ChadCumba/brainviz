/*
 * this is an implementation of classical inheritance in this system.
 * usage: extend(child,parent);
 */
 
function extend(subClass, superClass){
	var F = function(){};
	F.prototype = superClass.prototype;
	subClass.prototype = new F();
	subClass.prototype.constructor = subClass;
	
	subClass.superClass = superClass.prototype;
	
	if(superClass.prototype.constructor == Object.prototype.constructor){
		superClass.prototype.constructor = superClass;
	}
}
