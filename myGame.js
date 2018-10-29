/*
* @Author: colxi
* @Date:   2018-10-25 16:46:42
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-29 02:22:19
*/

let Viewport;
(async function(){
    Jsometric.Request.logRequests=true;
    Jsometric.Request.logResponses=true;
    //  Jsometric.Request.logEvents=true;
    //
    //let _canvas = await Jsometric.createCanvas( '#container' );
    Viewport = await new Jsometric.Viewport( '#viewport', 'demo-128' );
    Viewport.edgeScrolling     = true;
    Viewport.mouseWheelZoom    = true;

    Jsometric.Events.addListener('keydown', e=>{
        if(e.keyCode == 37)      Viewport.Scroll.x -= 10;
        else if(e.keyCode == 38) Viewport.Scroll.y -= 10;
        else if(e.keyCode == 39) Viewport.Scroll.x += 10;
        else if(e.keyCode == 40) Viewport.Scroll.y += 10;
    });

    // handle canvas right click
    Jsometric.Events.addListener('click', e=>{
        console.log(Viewport.Scroll.x, offsetX, Viewport.Scale.current);
    });

    // handle canvas left click
    Jsometric.Events.addListener('contextmenu', e=>{
        console.log('left click')  ;
    });

    function loop(){
        Viewport.renderFrame();
        requestAnimationFrame( loop );
    }
    loop()
})();
