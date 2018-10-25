/*
* @Author: colxi
* @Date:   2018-10-24 10:41:32
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-24 17:00:14
*/
import { Jsometric } from './src/jsometric.js';

/*
let map = await Jsometric.Map.load('demo-128');
let map = new Jsometric.Map({
    columns: 60,
    rows : 60,
    tileset: 'my-ts.jpg'
});

let viewport = Jsometric.Viewport( map );
*/

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


window.onkeydown = function(event){
    if(event.keyCode == 37) Jsometric.Viewport.scrollX -=10;
    else if(event.keyCode == 38) Jsometric.Viewport.scrollY -=10;
    else if(event.keyCode == 39) Jsometric.Viewport.scrollX +=10;
    else if(event.keyCode == 40) Jsometric.Viewport.scrollY +=10;
    event.preventDefault();
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
