/*
* @Author: colxi
* @Date:   2018-10-24 10:41:32
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-29 14:29:10
*/

Jsometric.Request = (function(){
    let requestId = 0;
    let requestResolver = {};

    self.onmessage = function(msg) {
        let type = msg.data.type;
        //
        if( type === 'request'){
            if(Jsometric.Request.logRequests) console.info('>>',msg.data);
            let method  = msg.data.method;
            let id      = msg.data.id;
            let args    = msg.data.arguments || [];
            let result  = Viewport[method]( ...args );
            if(result instanceof Promise) result.then( result => postMessage({ id:id, type:'response', response: result }) );
            else postMessage({ id:id, type:'response', response: result });
            // done!
        }else if( type === 'response'){
            if(Jsometric.Request.logResponses) console.info('>>',msg.data);
            let id       = msg.data.id;
            let response = msg.data.response;
            let resolve  = requestResolver[id];
            delete requestResolver[id];
            resolve( response );
            // done!
        }else if( type === 'event'){
            if(Jsometric.Request.logEvents) console.info('>>',msg.data);
            let eventName = msg.data.name;
            let data      = msg.data.data;
            if( !Jsometric.Events.Listeners.hasOwnProperty(eventName) ) return;
            for(let i=0; i<Jsometric.Events.Listeners[eventName].length;i++){
                Jsometric.Events.Listeners[eventName][i]( data );
            }
        }
    };

    return function(method, args){
        requestId++;
        if( !Array.isArray(args) ) args = [ args ];
        return new Promise( (resolve)=>{
            requestResolver[requestId] = resolve;
            let msg ={
                id        : requestId,
                type      : 'request',
                method    : method,
                arguments : args
            };
            self.postMessage(msg);
            if(Jsometric.Request.logRequests) console.info('<<',msg);
        });
    };

})();


Jsometric.Request.logRequests  = false;
Jsometric.Request.logResponses = false;
Jsometric.Request.logEvents    = false;



