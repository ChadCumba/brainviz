/*
 * Usage:
 * var myPub = new Publisher;
 * var mySubscriber = function(data){alert(data);}
 * mySubscriber.subscribe(myPub);
 * ...
 * myPub.deliver('hello');  //shows an alert saying hello
 * var myLogger = function(data){console.log(data)};
 * myLogger.subscribe(myPub);
 * myPub.deliver('hello again'); //shows an alert saying hello again and a log 
 * 								 //entry saying hello again
 */

/*
 * the basic publisher prototype
 * Publisher objects can publish data to subscribers
 */
function Publisher(){
	this.subscribers = [];
	
	this.deliver = function(data){
		this.subscribers.forEach(
			function(fn){
				fn(data);
			}
		);
		return this;
	};
}

/*
 * extend the function prototype to allow each function to subscribe
 * to a given publisher
 */
Function.prototype.subscribe = function(publisher){
	var that = this;
	var alreadyExists = publisher.subscribers.some(
		function(el){
			if (el === that){
				return;
			}
		}
	);
	if(!alreadyExists){
		publisher.subscribers.push(this);
	}
	return this;
};

/*
 * extend the function prototype to allow each function to unsubscribe 
 * from a given publisher
 */
Function.prototype.unsubscribe = function(publisher){
	var that = this;
	publisher.subscribers = publisher.subscribers.filter(
		function(el){
			if (el !== that){
				return el;
			}
		}
	);
	return this;
};
