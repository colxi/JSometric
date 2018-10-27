/*
* @Author: colxi
* @Date:   2018-10-24 10:41:32
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-27 16:03:08
*/

/* global Jsometric */


let offsetX=0;
let offsetY=0;
//  ScaleScrollModifierX =

Jsometric.Viewport = class Viewport{
    /**
     * Viewport Constructor
     * @param  {[offscreenCanvas]}  canvas
     * @param  {[object]}           map
     */
    constructor( canvas, map ) {
        // store offscreenCanvas reference
        this.Canvas      = canvas;
        // store Map reference
        this.Map         = map;
        // store Map Tileset reference
        this.Tileset     = map.Tileset;
        // store canvas 2d context
        this.Context     = canvas.getContext('2d');
        // Group to store Viewport Scroll absolute coordinates
        this.Scroll = {
            x : 0,
            y : 0
        };
        // Group to store Viewport Scale properties
        this.Scale = {
            current : 1,
            factor  : .02,
            min     : .20,
            max     : 2,
        };
        // Group to store Cartesian mouse coordiinates (if this.trackMouse=true)
        this.Mouse = {
            x : 0,
            y : 0
        };
        // Internal Event handlers properties
        this.__trackMouseHandler = undefined;
        this.__mouseWheelZoomHandler = undefined;

        //
        // CONFIGURE Viewport Instance
        //
        // Track Mouse : trigger the trackMouse setter (async)
        this.trackMouse = true;
        // Mouze Wheel Zoom :  trigger the mouseWheelZoom setter (async)
        this.mouseWheelZoom = true;

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

    zoomIn(x, y){ return this.zoom(x, y, this.Scale.current + this.Scale.factor) }
    zoomOut(x, y){ return this.zoom(x, y, this.Scale.current - this.Scale.factor) }
    zoom(x, y, level){
        // default values : Zoom in the center of the viewport using defaultFactor
        if( typeof x === 'undefined' ) x = Math.round( this.Canvas.width/2 );
        if( typeof y === 'undefined' ) y = Math.round( this.Canvas.height/2 );
        if( typeof level === 'undefined' ) level = this.Scale.current + this.Scale.factor;

        // calculate the value of the coordinate in scale 1:1
        let unscaledX = ( x / this.Scale.current ) + offsetX;
        let unscaledY = ( y / this.Scale.current ) + offsetY;

        // Round scale value to two decimals
        this.Scale.current = level;
        this.Scale.current = Math.round(this.Scale.current*100)/100;

        // apply zoom limits
        if(this.Scale.current < this.Scale.min) this.Scale.current = this.Scale.min;
        if(this.Scale.current > this.Scale.max) this.Scale.current = this.Scale.max;

        // calculate the new offsets (unscaled values)
        offsetX = ( unscaledX - (x / this.Scale.current) );
        offsetY = ( unscaledY - (y / this.Scale.current) );

        // apply new scale in a non acumulative way
        this.Context.setTransform(1, 0, 0, 1, 0, 0);
        this.Context.scale(this.Scale.current, this.Scale.current);

        return true;
    }

    getTileFromCoords(x, y){
        // calculate viewport mouse inner coordinates
        const mapX = x + (( this.Scroll.x + offsetX) * this.Scale.current );
        const mapY = y + (( this.Scroll.y + offsetY) * this.Scale.current );

        // get tile scaled sizes
        let tilewidth  = this.Tileset.tileWidth * this.Scale.current;
        let tileHeight = this.Tileset.tileHeight * this.Scale.current;
        let tileOffset = this.Tileset.tileOffset * this.Scale.current;
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
        let x = (row * this.Tileset.tileWidth / 2) + (column * this.Tileset.tileWidth / 2) - this.Scroll.x-offsetX;
        let y = (row * (this.Tileset.tileHeight - this.Tileset.tileOffset) / 2)-(column * (this.Tileset.tileHeight - this.Tileset.tileOffset) / 2)  - this.Scroll.y-offsetY;

        // avoid floating point coordinates , convert to integers
        x = Math.round(x) ;
        y = Math.round(y);

        return {
            x : x,
            y : y
        };
    }





};
