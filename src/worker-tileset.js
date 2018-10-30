
Jsometric.Tileset = {};

Jsometric.Tileset.load = async function( filename ){
    let Tileset;
    filename = `${BASE_URL}tilesets/${filename}`;
    console.log('[worker] : Loading Tileset definition file...', filename);
    let jsonTileset = await fetch(filename);
    if( jsonTileset.status !== 200) throw new Error(`Tileset '${filename}' not found.`);

    jsonTileset = await jsonTileset.json();
    Tileset = {
        name        : jsonTileset.name,
        columns     : jsonTileset.columns,
        rows        : jsonTileset.rows,
        source      : jsonTileset.source,
        width       : jsonTileset.width,
        height      : jsonTileset.height,
        tileWidth   : jsonTileset.tileWidth,
        tileHeight  : jsonTileset.tileHeight,
        tileOffset  : jsonTileset.tileOffset,
        tile        : [],
        image       : undefined,

    };

    for (var i = 0; i <= Tileset.columns * Tileset.rows; i++){
        let tileRow = Math.floor(i / Tileset.columns);
        let tileCol = Tileset.columns- (((tileRow+1) * Tileset.columns)-i);
        Tileset.tile[i] =[tileCol,tileRow];
    }
    let tilesetImage = await fetch( `${BASE_URL}tilesets/${Tileset.source}`);
    if( tilesetImage.status !== 200) throw new Error(`Tileset Image source '${BASE_URL}tilesets/${Tileset.source}' not found.`);

    tilesetImage = await tilesetImage.blob();
    Tileset.image = await createImageBitmap( tilesetImage );

    return Tileset;
/*
    let tilesetImage = new Image();
    tilesetImage.src = `./tilesets/${Map.Tileset.source}`;
    tilesetImage.onload = async () =>{
        Map.Tileset.image = await createImageBitmap(tilesetImage, {premultiplyAlpha:'premultiply'});
        queMsg( 'setMap', [Map]  );
        resolve( Map );
    };
*/

};
