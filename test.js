/*
* @Author: colxi
* @Date:   2018-10-24 10:41:32
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-27 23:25:53
*/

let resolver={};
let msgid=0;

let renderer = new Worker('./src/renderer.js');
let queMsg = function(method,data){
    msgid++;
    return new Promise( (resolve)=>{
        resolver[msgid] = resolve;
        renderer.postMessage({ type:'request', method:method, arguments:data, id:msgid });
    });
};


renderer.onmessage = function(msg){
    //console.log('DOM <<',msg.data)
    let type     = msg.data.type;
    if(type==='response'){
        let callId   = msg.data.id;
        let response = msg.data.response;
        let resolve  = resolver[callId];
        delete resolver[callId];
        resolve( response );
    }else if(type==='request'){
        let requestId = msg.data.id;
        let method    = msg.data.method;
        let args      = msg.data.arguments || [];
        if(typeof Jsometric[method] !== 'function') throw new Error('Jsometric (GUI) has no function "'+method+'"')
        let result    = Jsometric[method]( ...args );

        // if result has been glagged as tranafereable, prepare transfer array
        let transfer  = []
        if( result instanceof Jsometric.TransferableObject ){
            transfer.push( result.data );
            result = result.data;
        }
        // send response
        renderer.postMessage({
            id      : requestId,
            type    : 'response',
            response: result
        }, transfer );
    }else if(type==='event'){
        // something
    }
};


// create and dispatch the event
var VIEWPORT_RESIZE_EVENT = new CustomEvent("viewportresize");

let Jsometric={
    _canvas : undefined,
    TransferableObject : function( data ){
        if( !(this instanceof Jsometric.TransferableObject) ) throw new Error('Transferable Constructor must be called using \'new\'');
        this.data = data;
    },
    findTransferableObjects : function( item ){
        if( item instanceof Jsometric.TransferableObject ) return [ item.data ];
        let transferables = [];
        if( typeof item === 'object' || Array.isArray(item) ){
            for( let key in item ){
                if( typeof item === 'object'  && !item.hasOwnProperty(key) ) continue;
                if( item[key] instanceof Jsometric.TransferableObject ) transferables.push( item[key].data );
                if( typeof item[key]  === 'object' || Array.isArray( item[key] ) ){
                    transferables = transferables.concat( Jsometric.extractTransferables( item[key] ) );
                }
            }
        }
        return transferables;
    },
    _listenersCount : {},
    _eventListenerHandler : function(e){
        e.preventDefault();
        let data = {};
        let allowedTypes = ['string', 'undefined', 'number', 'boolean'];
        for(let key in e){
            if( allowedTypes.includes(typeof e[key]) ) data[key]=e[key];
        }
        if(e.type==='viewportresize'){
            data.offsetWidth  = e.target.offsetWidth;
            data.offsetHeight = e.target.offsetHeight;
        }
        renderer.postMessage({
            type    : 'event',
            name    : e.type,
            data    : data
        });
    },
    removeEventListener : function( eventName ){
        if( !Jsometric._listenersCount.hasOwnProperty( eventName ) ) return;

        Jsometric._listenersCount[ eventName ]--;
        if( Jsometric._listenersCount[ eventName ] === 0 ){
            delete Jsometric._listenersCount[ eventName ];
            Jsometric._canvas.removeEventListener( eventName , Jsometric._eventListenerHandler);
        }
        return true;
    },
    addEventListener : function( eventName , useCapture=false){
        if( !Jsometric._listenersCount.hasOwnProperty( eventName ) ){
            Jsometric._listenersCount[ eventName ] = 0;
        }
        Jsometric._listenersCount[ eventName ]++;

        Jsometric._canvas.addEventListener( eventName , Jsometric._eventListenerHandler, useCapture);
        return true;
    },
    canvas:function( CSSSelector ){
        let el = document.querySelector( CSSSelector );
        Jsometric._canvas=el;
        let offscreen = el.transferControlToOffscreen();
        //return new Jsometric.TransferableObject( offscreen );
        offscreen.width  = el.offsetWidth;
        offscreen.height = el.offsetHeight;
        offscreen =  new Jsometric.TransferableObject( offscreen );

        //
        var target = document.querySelector('#viewport');
        var ro = new ResizeObserver( entries => {
            el.dispatchEvent(VIEWPORT_RESIZE_EVENT);
        });
        ro.observe(target);

        return offscreen;
    }
};


/*

let engine = {
    onClick     : function(){},

    loadScript: function(s){
        return queMsg('loadScript',[s]);
    },
    getFps: function(){
        return queMsg('getFps',[]);
    },
    zoomIn : function(x,y){
        queMsg('zoomIn', [x,y] );
    },
    zoomOut : function(x,y){
        queMsg('zoomOut',[x,y] );
    },
    moveScrollX :function( diff ){
        queMsg('moveScrollX', [diff] );
    },
    moveScrollY :function( diff ){
        queMsg('moveScrollY',[diff] );
    },
    updateCursor : function(x, y){
        queMsg('updateCursor', [x,y] );

    },
    setViewport : function(el, width,height){
        el.addEventListener('contextmenu', function(e){ e.preventDefault() }, false );
        let offscreen = el.transferControlToOffscreen();
        renderer.postMessage({ method:'create', arguments:[offscreen,width,height] },[offscreen]);
    },
    setMap: function( name ){

    },

};

engine.loadScript('../myGame.js');

engine.setViewport( document.getElementById('viewport') , window.innerWidth , window.innerHeight);
engine.setMap( 'demo-128' );

// pause engne when page lose focus
document.addEventListener( 'visibilitychange',function() {
    if( document.hidden ) console.log('page hidden');
    else console.log('page displayed');
},false);

window.onkeydown = function(event){
    if(event.keyCode == 37) engine.moveScrollX(-10);
    else if(event.keyCode == 38) engine.moveScrollY(-10);
    else if(event.keyCode == 39) engine.moveScrollX(+10);
    else if(event.keyCode == 40) engine.moveScrollY(+10);
    event.preventDefault();
};

const _onWheelHandler = function(e){
    e.preventDefault();
    if( e.deltaY > 0 ) engine.zoomIn(e.offsetX, e.offsetY)
    else engine.zoomOut(e.offsetX, e.offsetY)
};

const _onMouseMoveHandler =  function(e){
    e.preventDefault();
    engine.updateCursor(e.offsetX, e.offsetY);
};

document.getElementById('viewport').addEventListener('wheel', _onWheelHandler, false);
document.getElementById('viewport').addEventListener('mousemove', _onMouseMoveHandler, false );
*/

/*
Jsometric.Map.load('demo-128').then( ()=>{
    tools_c.drawImage(
        Jsometric.Map.Tileset.image,
        0, //x
        0, //y
        Jsometric.Map.Tileset.width,
        Jsometric.Map.Tileset.height,
        0,
        0,
        Jsometric.Map.Tileset.width,
        Jsometric.Map.Tileset.height
    );
    //Jsometric.Viewport.render();
});



Jsometric.Viewport.onClick = function(event){
    if(event.button==0)  Jsometric.Map.tileData[event.tile.row][event.tile.column].push(current_tool);
    if(event.button==2)  Jsometric.Map.tileData[event.tile.row][event.tile.column].pop();
};

Jsometric.Viewport.onTileRender = function(column,row){
    if(column == Jsometric.Viewport.focusedTile.column && row == Jsometric.Viewport.focusedTile.row){
        Jsometric.Viewport.drawTile(current_tool, Jsometric.Viewport.focusedTile.column, Jsometric.Viewport.focusedTile.row);
    }
};










// Map.Tileset.tile set tools
var tools_canvas    = document.getElementById('tools');
var tools_c         = tools_canvas.getContext('2d');
var current_tool  = 1;
let tileSelectorScale = 0.25;
tools_c.scale(tileSelectorScale, tileSelectorScale);





tools_canvas.onclick = function(event){
    tools_c.clearRect (0, 0, Jsometric.Map.width, Jsometric.Map.height);
    tools_c.drawImage(
        Jsometric.Map.Tileset.image,
        0, //x
        0, //y
        Jsometric.Map.Tileset.width,
        Jsometric.Map.Tileset.height,
        0,
        0,
        Jsometric.Map.Tileset.width,
        Jsometric.Map.Tileset.height,
    );

    let tileX= Math.floor(event.offsetX/ (Jsometric.Map.Tileset.tileWidth*tileSelectorScale));  // 32 es 64 a escala
    let tileY= Math.floor(event.offsetY/ (Jsometric.Map.Tileset.tileHeight*tileSelectorScale) );
    current_tool = (tileY) * Jsometric.Map.Tileset.columns + tileX ;
    console.log(current_tool)
    tools_c.beginPath();
    tools_c.rect(
        tileX*Jsometric.Map.Tileset.tileWidth,
        tileY*Jsometric.Map.Tileset.tileHeight,
        Jsometric.Map.Tileset.tileWidth,
        Jsometric.Map.Tileset.tileHeight
    );
    tools_c.lineWidth = 2;
    tools_c.strokeStyle = 'red';
    tools_c.stroke();
};

// buttons listeners

document.getElementById('exportbut').onclick = function(){
    document.getElementById('export').value = JSON.stringify(Jsometric.Map.tileData)
}

document.getElementById('importbut').onclick = function(){
    Jsometric.Map.tileData = JSON.parse(document.getElementById('export').value)
}
*/
