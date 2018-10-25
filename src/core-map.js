
const Map = {
    tileData : [],
    columns  : 0,
    rows     : 0,
    Tileset : {
        image   : null,
        columns : 0,
        rows    : 0,
        source  : '',
        width   : 0,
        height  : 0,
        tile    : [], //eah key contains column/rowv of each tile in image
    },
    loadTileset: function(name){
        return new Promise( async (resolve,reject)=>{
            let tilesetData;
            tilesetData = await fetch(`./tilesets/${name}.json`);
            tilesetData = await tilesetData.json();
            tilesetData.tile = [];
            for (var i = 0; i <= tilesetData.columns * tilesetData.rows; i++){
                let tileRow = Math.floor(i / tilesetData.columns);
                let tileCol = tilesetData.columns- (((tileRow+1) * tilesetData.columns)-i);
                tilesetData.tile[i] =[tileCol,tileRow];
            }
            tilesetData.image = new Image();
            tilesetData.image.src = `./tilesets/${tilesetData.source}`;
            tilesetData.image.onload = () => resolve( tilesetData );
        });
    },
    load: async function(name){
        Map.reset();
        let mapData;
        let tilesetData;

        mapData = await fetch(`./maps/${name}.json`);
        mapData = await mapData.json();

        tilesetData  = await Map.loadTileset( mapData.tileset );
        Map.Tileset  = tilesetData;

        Map.tileData = JSON.parse( mapData.tileData );
        Map.columns  = mapData.columns;
        Map.rows     = mapData.rows;
        // done!
        return true;
    },
    reset : function(){
        Map.tileData = [];
        for (let col = 0; col <= Map.columns; col++){
            Map.tileData[col] = [];
            for(let row = 0; row <= Map.rows; row++) Map.tileData[col][row] = [0];
        }
    }
};


export { Map };
