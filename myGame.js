/*
* @Author: colxi
* @Date:   2018-10-25 16:46:42
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-27 16:03:39
*/

//Viewport.onAnimationFrame( x=>{});

let Viewport;
let Map;

class InputInterface{
    constructor( options ){
        this.__trackMouse = options.trackMouse || false;
        this.__trackKeyboard = options.trackKeyboard || false;
        this.Keys = {};
        this.Mouse = {};

    }



};

(async function(){
    /*
    Jsometric.Event.onKeyDown({
        handler: (event)=>{
            if(event.keyCode == 37) engine.moveScrollX(-10);
            else if(event.keyCode == 38) engine.moveScrollY(-10);
            else if(event.keyCode == 39) engine.moveScrollX(+10);
            else if(event.keyCode == 40) engine.moveScrollY(+10);
        },
        target : 'window',
        preventDefault : true,

    });
    */


    Jsometric.Request.logRequests=true;
    Jsometric.Request.logResponses=true;
   // Jsometric.Request.logEvents=true;
    let canvas           = await Jsometric.retrieveCanvas( '#viewport' );
    let map              = await Jsometric.Map.load('demo-128');
    let windowSize       = await Jsometric.getWindowSize();
    Viewport  = new Jsometric.Viewport( canvas, map );


    Viewport.width  = windowSize.width;
    Viewport.height = windowSize.height;


    Map =map;
    Jsometric.Renderer.renderFrame();
})();
