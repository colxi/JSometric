let LAST_TIMESTAMP=  Date.now();

Jsometric.Renderer = {
    fps:0,
    showProfiler:true,
    renderFrame : function (){
        // calculate fps
        let now                = Date.now();
        Jsometric.Renderer.fps = Math.floor( 1000/ (now-LAST_TIMESTAMP) );
        LAST_TIMESTAMP         = now;

        //_onAnimationFrame();

        // clear viewport
        Viewport.Context.clearRect(0, 0, Viewport.Canvas.width/Viewport.Scale.current, Viewport.Canvas.height/Viewport.Scale.current);
        //
        // OPTIMIZATIONS TOSO:  render only inscreen tiles
        // render in invisible canvas and dumpmcntent whennscene is ready
        //
        // Iterate columns  from right to left
        for (var column =Map.columns-1; column >=0 ; column--){
            // Iteraterows from top to bottom
            for (var row =0; row <  Map.rows  ; row++){
                // each cell can have multiple sprites, iterate them...
                for (var layer = 0; layer < Map.tileData[row][column].length; layer++){
                    Jsometric.Renderer.renderTile( Map.tileData[row][column][layer], column, row);
                    //Viewport.onTileRender(column, row);

                    //Viewport.Context.globalAlpha = 0.10;
                    //Jsometric.Renderer.renderTile( 7, column, row );
                    //Viewport.Context.globalAlpha = 1;
                }
            }
        }

        if(Jsometric.Renderer.showProfiler) Jsometric.Renderer.renderProfiler();

        let focusedTile = Viewport.getTileFromCoords(Viewport.Mouse.x, Viewport.Mouse.xY);
        if(focusedTile){
            Viewport.Context.globalAlpha = 0.40;
            Jsometric.Renderer.renderTile( 7, focusedTile.column, focusedTile.row );
            Viewport.Context.globalAlpha = 1;
        }

        requestAnimationFrame( Jsometric.Renderer.renderFrame  );
    },
    renderTile: function(tileId, column, row){
        // get canvas coordinates for the tile
        let tileCoordinates = Viewport.getTileCoordinates( column, row );

        // ignore request if tile is out of the viewport
        if( tileCoordinates.x> Viewport.Canvas.width/Viewport.Scale.current  ||
            tileCoordinates.x+Map.Tileset.tileWidth < 0        ||
            tileCoordinates.y > Viewport.Canvas.height/Viewport.Scale.current ||
            tileCoordinates.y+Map.Tileset.tileHeight < 0 ) return false;

        let tile = Map.Tileset.tile[tileId];
        Viewport.Context.drawImage(
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
    renderProfiler : function(){
        let focusedTile = Viewport.getTileFromCoords(Viewport.Mouse.x, Viewport.Mouse.y);

        Viewport.Context.save();
        Viewport.Context.setTransform(1, 0, 0, 1, 0, 0);

        Viewport.Context.fillRect(0, 0, 160, 120);

        Viewport.Context.font = '12px Arial';
        Viewport.Context.fillStyle = 'white';

        Viewport.Context.fillText(`column: ${ focusedTile !== false ? focusedTile.column : '-'} row: ${ focusedTile !== false ? focusedTile.row : '-'}`,10,25);
        Viewport.Context.fillText(`scale: ${ Viewport.Scale.current }`,10,40);
        Viewport.Context.fillText(`fps: ${ Jsometric.Renderer.fps }`,10,55);
        Viewport.Context.fillText(`View Cursor: ${ Viewport.Mouse.x },${ Viewport.Mouse.y }`,10,70);

        let mapX=  Math.round( Viewport.Mouse.x / Viewport.Scale.current ) + Viewport.Scroll.x;
        let mapY=  Math.round( Viewport.Mouse.y / Viewport.Scale.current ) + Viewport.Scroll.y;

        Viewport.Context.fillText(`Map Cursor: ${mapX} , ${mapY}`,10,85);
        Viewport.Context.fillText(`Scroll: ${Viewport.Scroll.x} , ${Viewport.Scroll.y}`,10,100);
        Viewport.Context.restore();
    }
};
