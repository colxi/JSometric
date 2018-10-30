
Jsometric.Map = {};

Jsometric.Map.load = async function( filename ){
    let jsonMap;
    filename = BASE_URL + 'maps/'+filename;
    console.log('[worker] : Loading map definition file...', filename)
    jsonMap = await fetch(filename)
    if( jsonMap.status !== 200) throw new Error(`Map '${filename}' not found.`)
    jsonMap = await jsonMap.json();
    let Map = {
        name     : jsonMap.name,
        columns  : jsonMap.columns,
        rows     : jsonMap.rows,
        tileset  : jsonMap.tileset,
        tileData : JSON.parse( jsonMap.tileData ),
        Tileset : {}
    };
    Map.Tileset = await Jsometric.Tileset.load( Map.tileset );

    return Map;
};

Jsometric.Map.generate = function(){};

