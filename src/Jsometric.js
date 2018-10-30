/*
* @Author: colxi
* @Date:   2018-10-24 10:41:32
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-30 01:13:27
*/
const VIEWPORT_RESIZE_EVENT = new CustomEvent('viewportresize');
const VIEWPORT_STYLE = `
    html,body{
        margin   : 0px;
        width    : 100%;
        height   : 100%;
        margin   : 0px;
        overscroll-behavior-y : contain;
        overscroll-behavior-x : contain;
    }

    [jsometric-viewport]{ position : relative; }
`;

let resolver={};
let requestId=0;
let requestResolver={};
let renderer;

async function onMsg(msg){
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
        let result    = await Jsometric[method]( ...args );

        // if result has been glagged as tranafereable, prepare transfer array
        let transfer  = [];
        if( result.hasOwnProperty('_transferFlag_') ){
            delete result._transferFlag_;
            transfer = Array.isArray(result) ? result : [result];
        }
        // send response
        renderer.postMessage({
            id      : requestId,
            type    : 'response',
            response: result
        }, transfer );
    }else if(type==='event'){
        // something
    }else throw new Error('unknown message type');
};

function msg(method, args){
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


let Jsometric={
    container : null,
    initialize : function(id){
        // block if has been initialized previously
        if(Jsometric.container){
            console.warn('Jsometric.initialize() : Only one instance is allowed. Aborted.');
            return false;
        }

        // select and store the container elementnreference
        let target = document.getElementById(id);
        if(!target){
            console.warn(`Jsometric.initialize() : Can't find any element with the provided id (#${id}) ! Aborted.`);
            return false;
        }else Jsometric.container = target;

        // block if containeris not empty
        if( Jsometric.container.innerHTML.trim() !== '' ){
            console.warn(`Jsometric.initialize() : The target container (#${id}) is not empty! Aborted.`);
            return false;
        }

        // flag the container element as a viewport
        Jsometric.container.setAttribute('jsometric-viewport','true');

        // ensure container can recieve focus (using tabindex attribute)
        if( !Jsometric.container.hasAttribute('tabindex') ) Jsometric.container.setAttribute('tabindex','1');

        // populate the container with canvas layers
        Jsometric.container.innerHTML=`
            <canvas class="jsometric-background" style="position:absolute;width:100%;height:100%"></canvas>
            <canvas class="jsometric-terrain"    style="position:absolute;width:100%;height:100%"></canvas>
            <canvas class="jsometric-objects"    style="position:absolute;width:100%;height:100%"></canvas>
            <canvas class="jsometric-sky"        style="position:absolute;width:100%;height:100%"></canvas>
            <canvas class="jsometric-fog"        style="position:absolute;width:100%;height:100%"></canvas>
            <canvas class="jsometric-foreground" style="position:absolute;width:100%;height:100%"></canvas>
        `;
        // collect thd canvas layers in an array and set the size of
        // each layer to match the container width and height
        let offscreenCanvasArray = [];
        let layers = Array.from( Jsometric.container.querySelectorAll('canvas') );
        layers.forEach( i=>{
            let offscreen    = i.transferControlToOffscreen();
            offscreen.width  = Jsometric.container.offsetWidth;
            offscreen.height = Jsometric.container.offsetHeight;
            offscreenCanvasArray.push( offscreen );
        });
        // If te ResizeObserver API is available, set an observer, that will
        // trigger a VIEWPORT_RESIZE_EVENT on the container, every time the
        // container size changes
        if(typeof ResizeObserver !== 'undefined'){
            var onResize = new ResizeObserver( ()=>{
                Jsometric.container.dispatchEvent(VIEWPORT_RESIZE_EVENT);
            });
            onResize.observe(Jsometric.container);
        }
        // is ResizeObserver is not available, set an onresize listener on the
        // window element, hat will trgger a VIEWPORT_RESIZE_EVENT on the
        // container, every time the window size changes (workarround). In this
        // case, any resize applied to he container, not caused by a windows
        // resize, must be notified manually using
        // Jsometric.container.dispatchEvent(VIEWPORT_RESIZE_EVENT);
        // ...or the container resize will be missed
        else{
            window.addEventListener('resize', ()=> Jsometric.containerdispatchEvent(VIEWPORT_RESIZE_EVENT) );
        }
        // flag the resulting offscreenCanvas array as transfereable (custom flag)
        offscreenCanvasArray._transferFlag_ = true;
        return offscreenCanvasArray;
    },
    /**
     * [load description] Inits the webworker and pass to him (using url params)
     * the path to the user script to be loaded in the worker side
     * @param  {[type]} fileName [description]
     * @return {[type]}          [description]
     */
    load : function(fileName){
        let styles= document.createElement('style');
        styles.innerHTML = VIEWPORT_STYLE;
        document.head.appendChild(styles);

        // get path of module to be able to find location of worker scripts
        let baseUrl = import.meta.url.split('/'); // eslint-disable-line
        baseUrl.splice(-1);
        baseUrl = baseUrl.join('/') + '/';
        // if filename is nit ab absolute oath, use document.pathname to build
        // an absolute path to the requested file

        renderer = new Worker(baseUrl+'worker.js/?pathname='+document.location.pathname+'&filename='+fileName);
        renderer.onmessage =  onMsg;
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
            Jsometric.container.removeEventListener( eventName , Jsometric._eventListenerHandler);
        }
        return true;
    },
    addEventListener : function( eventName , useCapture=false){
        if( !Jsometric._listenersCount.hasOwnProperty( eventName ) ){
            Jsometric._listenersCount[ eventName ] = 0;
        }
        Jsometric._listenersCount[ eventName ]++;

        Jsometric.container.addEventListener( eventName , Jsometric._eventListenerHandler, useCapture);
        return true;
    }
};

/*
// pause engne when page lose focus
document.addEventListener( 'visibilitychange',function() {
    if( document.hidden ) console.log('page hidden');
    else console.log('page displayed');
},false);
*/



export {Jsometric};


