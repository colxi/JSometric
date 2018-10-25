
import { Map } from './core-map.js';
import { ViewportInfo } from './core-viewport-info.js';


let LAST_TIMESTAMP=  Date.now();
let offsetX=0;
let offsetY=0;


const _onClickHandler =  function(e){
    e.preventDefault();
    let mouseEvent = Viewport.getMouseEventCoordinates(e);
    Viewport.focusedTile = mouseEvent.tile;
    Viewport.onClick(mouseEvent);
};

const _onMouseMoveHandler =  function(e){
    e.preventDefault();
    let mouseEvent = Viewport.getMouseEventCoordinates(e);
    Viewport.focusedTile = mouseEvent.tile;
    Viewport.mouseX= e.offsetX;
    Viewport.mouseY= e.offsetY;
    Viewport.onMouseMove(mouseEvent);
};

const _onWheelHandler = function(e){
    e.preventDefault();
    let direction = e.deltaY > 0 ? 1 : -1;
    let zoomLevel = Viewport.scale + (Viewport.zoomFactor * direction);
    Viewport.zoom(e.offsetX, e.offsetY, zoomLevel);
};

const Viewport = {
    element     : document.getElementById('viewport'),
   // context     : document.getElementById('viewport').getContext('2d'),
    scrollX     : 0,
    scrollY     : 0,
    width       : window.innerWidth,
    height      : window.innerHeight,
    scale       : 1,
    zoomMax     : 2,
    zoomMin     : .20,
    zoomFactor  : .02,
    focusedTile : false,
    mouseX      : 0,
    mouseY      : 0,
    showInfo    : true,
    fps         : 0,
    set smoothing(val){ Viewport.context.imageSmoothingEnabled=val },
    get smoothing(){ return Viewport.context.imageSmoothingEnabled },

    //
    onClick     : function(){},
    onMouseMove : function(){},
    onTileRender: function(){},
    onAfterRender : function(){},
    /**
     * [scale description]
     * @return {[type]} [description]
     */
    zoom : function(x,y,level){
        // default values : Zoom in the center of the viewport using defaultFactor
        if( typeof x === 'undefined' ) x= Math.round( Viewport.width/2 );
        if( typeof y === 'undefined' ) y= Math.round( Viewport.height/2 );
        if( typeof level === 'undefined' ) level = Viewport.scale + Viewport.zoomFactor;

        // calculate the value of the coordinate in scale 1:1
        let unscaledX = ( x / Viewport.scale ) + offsetX;
        let unscaledY = ( y / Viewport.scale ) + offsetY;

        // Round scale value to two decimals
        Viewport.scale = level;
        Viewport.scale = Math.round(Viewport.scale*100)/100;

        // apply zoom limits
        if(Viewport.scale < Viewport.zoomMin) Viewport.scale = Viewport.zoomMin;
        if(Viewport.scale > Viewport.zoomMax) Viewport.scale = Viewport.zoomMax;

        // calculate the new offsets (unscaled values)
        offsetX = ( unscaledX - (x  / Viewport.scale) );
        offsetY = ( unscaledY - (y / Viewport.scale) );

        // apply new scale in a non acumulative way
        Viewport.context.setTransform(1, 0, 0, 1, 0, 0);
        Viewport.context.scale(Viewport.scale, Viewport.scale);
    },
    /**
     * [getMouseEventCoordinates description]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    getMouseEventCoordinates: function(e){
        // calculate viewport mouse inner coordinates
        const mapX = Viewport.mouseX + (( Viewport.scrollX + offsetX) * Viewport.scale );
        const mapY = Viewport.mouseY + (( Viewport.scrollY + offsetY) * Viewport.scale );

        // get tile scaled sizes
        let tilewidth  = Map.Tileset.tileWidth * Viewport.scale;
        let tileHeight = Map.Tileset.tileHeight * Viewport.scale;
        let tileOffset = Map.Tileset.tileOffset * Viewport.scale;
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
            tile.row>Map.rows-1 ||
            tile.column>Map.columns-1 ) tile = false;

        // done!
        return {
            event : e,
            viewportX : e.offsetX,
            viewportY : e.offsetY,
            button: e.button,
            tile  : tile
        };
    },
    /**
     * [getTileCoordinates description]
     * @param  {[type]} _column [description]
     * @param  {[type]} _row    [description]
     * @return {[type]}         [description]
     */
    getTileCoordinates: function(_column,_row){
        let x = (_row * Map.Tileset.tileWidth / 2) + (_column * Map.Tileset.tileWidth / 2) - Viewport.scrollX-offsetX;
        let y = (_row * (Map.Tileset.tileHeight - Map.Tileset.tileOffset) / 2)-(_column * (Map.Tileset.tileHeight - Map.Tileset.tileOffset) / 2)  - Viewport.scrollY-offsetY;

        // avoid floating point coordinates , convert to integers
        x = (0.5 + x) | 0;
        y = (0.5 + y) | 0;

        return {
            x : x,
            y : y
        };
    },
    /**
     * [drawTile description]
     * @param  {[type]} tileId [description]
     * @param  {[type]} column [description]
     * @param  {[type]} row    [description]
     * @return {[type]}        [description]
     */
    drawTile: function(tileId, column, row){
        // get canvas coordinates for the tile
        let tileCoordinates = Viewport.getTileCoordinates( column, row );

        // ignore request if tile is out of the viewport
        if( tileCoordinates.x> Viewport.width/Viewport.scale   ||
            tileCoordinates.x+Map.Tileset.tileWidth < 0        ||
            tileCoordinates.y > Viewport.height/Viewport.scale ||
            tileCoordinates.y+Map.Tileset.tileHeight < 0 ) return false;

        let tile = Map.Tileset.tile[tileId];
        Viewport.context.drawImage(
            Map.Tileset.image,
            tile[0]*Map.Tileset.tileWidth, //x
            tile[1]*Map.Tileset.tileHeight, //y
            Map.Tileset.tileWidth,
            Map.Tileset.tileHeight,
            tileCoordinates.x,
            tileCoordinates.y,
            Map.Tileset.tileWidth,
            Map.Tileset.tileHeight
        );
    },
    /**
     * [render description]
     * @return {[type]} [description]
     */
    render: function (){
        // calculate fps
        let now        = Date.now();
        Viewport.fps   = Math.floor( 1000/ (now-LAST_TIMESTAMP) );
        LAST_TIMESTAMP = now;
        // clear viewport
        Viewport.context.clearRect(0, 0, Viewport.width/Viewport.scale, Viewport.height/Viewport.scale);
        //
        // OPTIMIZATIONS TOSO:  render only inscreen tiles
        // render in invisible canvas and dumpmcntent whennscene is ready
        //
        // Iterate columns  from right to left
        for (var column =Map.columns-1; column >=0 ; column--){
            // Iteraterows from top to bottom
            for (var row =0; row <  Map.rows  ; row++){
                // each cell can have multiple sprites, iterate them...
                for (var layer = 0; layer <= Map.tileData[row][column].length -1; layer++){
                    Viewport.drawTile( Map.tileData[row][column][layer], column, row);
                    Viewport.onTileRender(column, row);

                    //Viewport.context.globalAlpha = 0.10;
                    //Viewport.drawTile( 7, column, row );
                    //Viewport.context.globalAlpha = 1;
                }
            }
        }

        if(Viewport.showInfo) ViewportInfo.render();

        if(Viewport.focusedTile){
            Viewport.context.globalAlpha = 0.40;
            Viewport.drawTile( 7, Viewport.focusedTile.column, Viewport.focusedTile.row );
            Viewport.context.globalAlpha = 1;
        }

        requestAnimationFrame(Viewport.render);
    }
};

Viewport.element.addEventListener('mousedown', _onClickHandler, false );
Viewport.element.addEventListener('mousemove', _onMouseMoveHandler, false );
Viewport.element.addEventListener('wheel', _onWheelHandler, false);
Viewport.element.addEventListener('contextmenu', function(e){ e.preventDefault() }, false );


document.getElementById('viewport').width = window.innerWidth;
document.getElementById('viewport').height = window.innerHeight;
//Viewport.context.imageSmoothingEnabled=false;


let renderer = new Worker('./src/renderer.js');
var offscreen = Viewport.element.transferControlToOffscreen();
//var ctx = Viewport.context.canvas.getContext('2d');
//var imageData = ctx.createImageData(Viewport.width, Viewport.height);
renderer.postMessage({ type:'create', data:offscreen },[offscreen]);
/*
renderer.onmessage = function (e) {
    var ctx = Viewport.context.canvas.getContext('2d');
    ctx.putImageData(e.data.image, 0, 0);
};
*/


export { Viewport };
