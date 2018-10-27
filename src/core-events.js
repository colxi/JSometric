/*
* @Author: colxi
* @Date:   2018-10-24 10:41:32
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-27 15:44:20
*/
/* global Jsometric */




Jsometric.Events = {};

Jsometric.Events.removeListener = function(eventName, listener){
    // if event has not been declared previously, return
    if( !Jsometric.Events.Listeners.hasOwnProperty( eventName ) ) return;

    let index = Jsometric.Events.Listeners[eventName].indexOf( listener );
    if( index === -1 ) return;

    Jsometric.Events.Listeners[eventName].splice(index,1);
    Jsometric.Request('removeEventListener', [eventName] );
};

Jsometric.Events.addListener = function(eventName, listener, useCapture=false){
    // if event has not been declared previously, create a new entry
    if( !Jsometric.Events.Listeners.hasOwnProperty( eventName ) ){
        Jsometric.Events.Listeners[ eventName ] = [];
    }
    // if eventlistener has been declared previously in current event
    // ignore and abort the request
    if( Jsometric.Events.Listeners[ eventName ].includes( listener ) ) return;

    // add listener
    Jsometric.Events.Listeners[ eventName ].push( listener );

    Jsometric.Request('addEventListener', [ eventName, Boolean(useCapture) ] );
};

Jsometric.Events.Listeners ={};
