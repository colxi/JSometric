
Jsometric.Map = {};

Jsometric.Map.load = async function( name ){
    let jsonMap;
    jsonMap = await fetch(`./../maps/${name}.json`);
    if( jsonMap.status !== 200) throw new Error(`Map '${name}.json' not found.`)
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

Jsometric.generate = function(){};

