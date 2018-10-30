/*
* @Author: colxi
* @Date:   2018-10-24 10:41:32
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-30 01:21:26
*/

/* global Jsometric */

Jsometric.Viewport = class Viewport{
    /**
     * Viewport Constructor
     * @param  {[offscreenCanvas]}  canvas
     * @param  {[object]}           map
     */
    constructor( containerId , map ) {
        return (async () => {
            // Generate Canvas layers in DOM, and retrieve the
            // offscreenCanvas references.
            let canvasLayers = await Jsometric.Request('initialize', containerId);
            if(!canvasLayers) throw new Error('Viewport.constructor() : Failed retrieving Container');

            this.Canvas = canvasLayers[0];
            this.Map     = await Jsometric.Map.load( map );

            // store canvas 2d context
            this.Context = this.Canvas.getContext('2d');

            // Group to store Viewport Scroll absolute coordinates
            this.Scroll = {
                x : 0,
                y : 0
            };
            // Group to store Viewport Edge Scrolling configuration.
            this.EdgeScroll = {
                rate        : 10,    // scroll movement units
                linear      : true,  // true = smoth transition
                top         : 50,    // top Threshold
                bottom      : 50,    // bottom Threshold
                left        : 50,    // left Threshold
                right       : 50,    // right Threshold
            };
            // Group to store Viewport Scale properties
            this.Scale = {
                current : 1,
                factor  : .02,
                min     : .20,
                max     : 2
            };
            // Group to store Cartesian mouse coordiinates (if this.trackMouse=true)
            this.Mouse = {
                x : Math.round( this.Canvas.width  / 2 ),
                y : Math.round( this.Canvas.height / 2 )
            };

            // Internal Event handlers properties
            this.__trackMouseHandler     = undefined;
            this.__mouseWheelZoomHandler = undefined;

            // autoscroll on viewport edges mouseover disabled by defaulg
            this.edgeScrolling = false;

            this.fps=0;

            this.fpsAverage = 0;
            this.fpsLast =[];
            this.lastFrameTimestamp =Date.now();
            this.showProfiler=true;

            //
            // CONFIGURE Viewport Instance
            //
            this.imageSmoothing = false
            // Track Mouse : trigger the trackMouse setter (async)
            this.trackMouse = true;
            // Mouse Wheel Zoom :  trigger the mouseWheelZoom setter
            this.mouseWheelZoom = false;
            // Handle canvas size changes
            Jsometric.Events.addListener('viewportresize', e=>{
                // keep the viewport centered in the current position
                // once the new size is setted, adjusting the scroll
                this.Scroll.x +=  Math.round( ( this.width - e.offsetWidth ) / this.Scale.current / 2 );
                this.Scroll.y +=  Math.round( ( this.height - e.offsetHeight ) / this.Scale.current / 2 );
                // set new size
                this.width  = e.offsetWidth;
                this.height = e.offsetHeight;
                // reasign the scale (lost by the canvssize modification)
                this.Context.scale( this.Scale.current, this.Scale.current );
                // set mouse coordinats to the (safe) center of the viewport
                this.Mouse.x = Math.round( this.Canvas.width   / 2 );
                this.Mouse.y = Math.round( this.Canvas.height  / 2 );
            });
            // Handle mouse out event.
            Jsometric.Events.addListener('mouseout', e=>{
                // set mouse cursor to the (safe) center of the
                // viewport (stops edges scrolling if active)
                this.Mouse.x = Math.round( this.Canvas.width   / 2 );
                this.Mouse.y = Math.round( this.Canvas.height  / 2 );
            })

            return this; // when done
        })();
    }

    /**
     * Get/Set Canvas Width property
     */
    get width(){ return this.Canvas.width }
    set width( w ){
        this.Canvas.width = w;
        return true;
    }

    /**
     * Get/Set Canvas height property
     */
    get height(){ return this.Canvas.height }
    set height( h ){
        this.Canvas.height = h;
        return true;
    }

    /**
     * Get/Set Canvas imageSmoothing property
     */
    get imageSmoothing(){ return this.Context.imageSmoothingEnabled }
    set imageSmoothing( v ){
        this.Context.imageSmoothingEnabled  = v;
        return true;
    }

    /**
     * Get/Set trackMouse property (adds/removes event listeners)
     */
    get trackMouse(){
        // getter
        return this.__trackMouseHandler ? true : false;
    }
    set trackMouse( v ){
        // cast to Boolean
        v = Boolean(v);

        if( v ){
            // if mouse tracking is not already active...
            if( !this.__trackMouseHandler ){
                // create the handler as an arrow function to preserve the 'this'
                // context, when called back, on the event notification
                this.__trackMouseHandler = (e)=>{
                    this.Mouse.x = e.offsetX;
                    this.Mouse.y = e.offsetY;
                };
                // add the listener
                Jsometric.Events.addListener('mousemove',this.__trackMouseHandler);
            }
        }
        else{
            // if mouse tracking is active...
            if( this.__trackMouseHandler ){
                Jsometric.Events.removeListener('mousemove',this.__trackMouseHandler);
                this.__trackMouseHandler = undefined;
            }
        }
        // done!!
        return v;
    }

    /**
     * Get/Set mouseWheelZoom property (adds/removes event listeners)
     */
    get mouseWheelZoom(){
        // getter
        return this.__mouseWheelZoomHandler ? true : false;
    }
    set mouseWheelZoom( v ){
        // cast to Boolean
        v = Boolean(v);

        if( v ){
            // if mouse tracking is not already active...
            if( !this.__mouseWheelZoomHandler ){
                // create the handler as an arrow function to preserve the 'this'
                // context, when called back, on the event notification
                this.__mouseWheelZoomHandler = (e)=>{
                    if( e.deltaY > 0 ) this.zoomIn(e.offsetX, e.offsetY);
                    else this.zoomOut(e.offsetX, e.offsetY);
                };
                // add the listener
                Jsometric.Events.addListener('mousewheel', this.__mouseWheelZoomHandler);
            }
        }
        else{
            // if mouse tracking is active...
            if( this.__mouseWheelZoomHandler ){
                Jsometric.Events.removeListener('mousewheel',this.__mouseWheelZoomHandler);
                this.__mouseWheelZoomHandler = undefined;
            }
        }
        // done!!
        return v;
    }

    __edgeScrollingHandler(){
        let scrollX, scrollY, distance;
        // left
        if( this.Mouse.x < this.EdgeScroll.left ){
            if( this.EdgeScroll.linear ){
                distance   = this.EdgeScroll.left - this.Mouse.x;
                scrollX    = (distance * this.EdgeScroll.rate / this.EdgeScroll.left);
            } else scrollX = this.EdgeScroll.rate;
            this.Scroll.x -= Math.round(scrollX);
        }
        // right
        else if( this.Mouse.x > this.Canvas.width - this.EdgeScroll.right ){
            if( this.EdgeScroll.linear ){
                distance   = this.Mouse.x - ( this.Canvas.width - this.EdgeScroll.right );
                scrollX    =  distance * this.EdgeScroll.rate / this.EdgeScroll.right ;
            } else scrollX = this.EdgeScroll.rate;
            this.Scroll.x += Math.round(scrollX);
        }
        // top
        if( this.Mouse.y < this.EdgeScroll.top){
            if( this.EdgeScroll.linear ){
                distance   = this.EdgeScroll.top - this.Mouse.y;
                scrollY    = (distance * this.EdgeScroll.rate / this.EdgeScroll.top);
            } else scrollY = this.EdgeScroll.rate;
            this.Scroll.y -= Math.round(scrollY);
        }
        // bottom
        else if( this.Mouse.y > this.Canvas.height - this.EdgeScroll.bottom ){
            if( this.EdgeScroll.linear ){
                distance   = this.Mouse.y - ( this.Canvas.height - this.EdgeScroll.bottom );
                scrollY    = distance * this.EdgeScroll.rate / this.EdgeScroll.bottom;
            } else scrollY = this.EdgeScroll.rate;
            this.Scroll.y += Math.round(scrollY);
        }
    }

    scrollTo(x,y,time){
        let frames = time / Viewport.Renderer.fps;

        // ease inOut
        // let ani= new Jsometric.Animation( callback, duration)
        /*
        for(var i = 0 ; i < 100 ; i++){
        t = i/100;
        var y = t > 0.5 ? 4*Math.pow((t-1),3)+1 : 4*Math.pow(t,3);
        console.log('y:'+ y + ' t:' +t);
        }
        */

    }

    /***********************************^***************************************
     *
     *    ZOOM METHODS
     *
     ***********************************^**************************************/
    zoomIn(x, y){ return this.zoom(x, y, this.Scale.current + this.Scale.factor) }
    zoomOut(x, y){ return this.zoom(x, y, this.Scale.current - this.Scale.factor) }
    zoom(x, y, level){
        // default values : Zoom in the center of the viewport using defaultFactor
        if( typeof x === 'undefined' ) x = Math.round( this.Canvas.width/2 );
        if( typeof y === 'undefined' ) y = Math.round( this.Canvas.height/2 );
        if( typeof level === 'undefined' ) level = this.Scale.current + this.Scale.factor;

        let oldScale = this.Scale.current;

        // Round scale value to two decimals
        this.Scale.current = level;
        this.Scale.current = Math.round(this.Scale.current*100)/100;

        // apply zoom limits
        if(this.Scale.current < this.Scale.min) this.Scale.current = this.Scale.min;
        if(this.Scale.current > this.Scale.max) this.Scale.current = this.Scale.max;

        // calculate the new scroll values
        this.Scroll.x += ( x / oldScale ) - ( x / this.Scale.current );
        this.Scroll.y += ( y / oldScale ) - ( y / this.Scale.current );
        this.Scroll.x = Math.round( this.Scroll.x );
        this.Scroll.y = Math.round( this.Scroll.y );

        // apply new scale in a non acumulative way
        this.Context.setTransform(1, 0, 0, 1, 0, 0);
        this.Context.scale(this.Scale.current, this.Scale.current);

        return true;
    }


    /***********************************^***************************************
     *
     *    COORDINATES METHODS
     *
     ***********************************^**************************************/
    getTileFromCoords(x, y){
        // calculate viewport mouse inner coordinates
        const mapX = x + ( this.Scroll.x * this.Scale.current );
        const mapY = y + ( this.Scroll.y * this.Scale.current );

        // get tile scaled sizes
        let tilewidth  = this.Map.Tileset.tileWidth * this.Scale.current;
        let tileHeight = this.Map.Tileset.tileHeight * this.Scale.current;
        let tileOffset = this.Map.Tileset.tileOffset * this.Scale.current;
        // calculate tile  under mouse coordinates
        const tileRow = mapX/tilewidth + mapY/(tileHeight-tileOffset) -1 -1;
        const tileCol = mapX/( tileHeight-tileOffset) - tileRow - 1;
        // Round the values after calculations, to prevent ugly bug on  those
        // coordinates close to the tile edges (unproper tile column resolution)
        let tile = {
            column : Math.round( tileCol ),
            row    : Math.round( tileRow )
        };
        // if no tile  found under the mouse, set to false
        if( tile.row<0 ||
            tile.column<0 ||
            tile.row>this.Map.rows-1 ||
            tile.column>this.Map.columns-1 ) tile = false;

        return tile;
    }
    getTileCoordinates(column ,row){
        let x = (row * this.Map.Tileset.tileWidth / 2) + (column * this.Map.Tileset.tileWidth / 2) - this.Scroll.x;
        let y = (row * (this.Map.Tileset.tileHeight - this.Map.Tileset.tileOffset) / 2)-(column * (this.Map.Tileset.tileHeight - this.Map.Tileset.tileOffset) / 2)  - this.Scroll.y;

        // avoid floating point coordinates , convert to integers
        x = Math.round(x) ;
        y = Math.round(y);

        return {
            x : x,
            y : y
        };
    }


    /***********************************^***************************************
     *
     *    RENDER METHODS
     *
     ***********************************^**************************************/
    renderFrame(){
        // calculate fps
        let now = Date.now();
        this.fps = Math.round( 1000/ (now-this.lastFrameTimestamp) );
        this.lastFrameTimestamp = now;

        // calculate average fps
        if( this.fpsLast.length < 60 ) this.fpsLast.push( this.fps );
        else{
            let sum = this.fpsLast.reduce(function(a, b) { return a + b }, 0);
            let average = sum / this.fpsLast.length;
            this.fpsAverage = Math.round( average );
            this.fpsLast= [];
        }

        if( this.edgeScrolling ) this.__edgeScrollingHandler();

        // clear viewport
        this.Context.clearRect(0, 0, this.Canvas.width/this.Scale.current, this.Canvas.height/this.Scale.current);
        //
        // OPTIMIZATIONS TOSO:  render only inscreen tiles
        // render in invisible canvas and dumpmcntent whennscene is ready
        //
        // Iterate columns  from right to left
        for (var column =this.Map.columns-1; column >=0 ; column--){
            // Iteraterows from top to bottom
            for (var row =0; row <  this.Map.rows  ; row++){
                // each cell can have multiple sprites, iterate them...
                for (var layer = 0; layer < this.Map.tileData[row][column].length; layer++){
                    this.renderTile( this.Map.tileData[row][column][layer], column, row);

                    //this.Context.globalAlpha = 0.10;
                    //this.renderTile( 7, column, row );
                    //this.Context.globalAlpha = 1;
                }
            }
        }

        if(this.showProfiler) this.renderProfiler();

        let focusedTile = this.getTileFromCoords(this.Mouse.x, this.Mouse.y);
        if(focusedTile){
            this.Context.globalAlpha = 0.40;
            this.renderTile( 7, focusedTile.column, focusedTile.row );
            this.Context.globalAlpha = 1;
        }
    }
    renderTile(tileId, column, row){
        // get canvas coordinates for the tile
        let tileCoordinates = this.getTileCoordinates( column, row );

        // ignore request if tile is out of the viewport
        if( tileCoordinates.x > this.Canvas.width/this.Scale.current  ||
            tileCoordinates.x + this.Map.Tileset.tileWidth < 0        ||
            tileCoordinates.y > this.Canvas.height/this.Scale.current ||
            tileCoordinates.y + this.Map.Tileset.tileHeight < 0 ) return false;

        let tile = this.Map.Tileset.tile[tileId];
        this.Context.drawImage(
            this.Map.Tileset.image,
            tile[0]*this.Map.Tileset.tileWidth, //x
            tile[1]*this.Map.Tileset.tileHeight, //y
            this.Map.Tileset.tileWidth,
            this.Map.Tileset.tileHeight,
            tileCoordinates.x,
            tileCoordinates.y,
            this.Map.Tileset.tileWidth,
            this.Map.Tileset.tileHeight
        );
    }
    renderProfiler(){
        let focusedTile = this.getTileFromCoords(this.Mouse.x, this.Mouse.y);

        this.Context.save();
        this.Context.setTransform(1, 0, 0, 1, 0, 0);

        this.Context.fillRect(0, 0, 160, 120);

        this.Context.font = '12px Arial';
        this.Context.fillStyle = 'white';

        this.Context.fillText(`column: ${ focusedTile !== false ? focusedTile.column : '-'} row: ${ focusedTile !== false ? focusedTile.row : '-'}`,10,25);
        this.Context.fillText(`scale: ${ this.Scale.current }`,10,40);
        this.Context.fillText(`fps: ${ this.fpsAverage }`,10,55);
        this.Context.fillText(`View Cursor: ${ this.Mouse.x },${ this.Mouse.y }`,10,70);

        let mapX=  Math.round( this.Mouse.x / this.Scale.current ) + this.Scroll.x;
        let mapY=  Math.round( this.Mouse.y / this.Scale.current ) + this.Scroll.y;

        this.Context.fillText(`Map Cursor: ${mapX} , ${mapY}`,10,85);
        this.Context.fillText(`Scroll: ${this.Scroll.x} , ${this.Scroll.y}`,10,100);
        this.Context.restore();
    }

};






