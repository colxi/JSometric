/*
* @Author: colxi
* @Date:   2018-10-23 23:15:12
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-23 23:20:51
*/
import { Viewport } from './core-viewport.js';

let viewportInfo = document.getElementById('viewport-info');
viewportInfo.width = 150;
viewportInfo.height = 120;
viewportInfo.style = 'background:black;position: absolute;';
let viewportInfoContext = viewportInfo.getContext('2d');

const ViewportInfo = {
    render : function(){
        // clear viewport
        viewportInfoContext.clearRect(0, 0, viewportInfo.width, viewportInfo.height);

        viewportInfoContext.font = '12px Arial';
        viewportInfoContext.fillStyle = 'white';

        viewportInfoContext.fillText(`column: ${ Viewport.focusedTile !== false ? Viewport.focusedTile.column : '-'} row: ${ Viewport.focusedTile !== false ? Viewport.focusedTile.row : '-'}`,10,25);
        viewportInfoContext.fillText(`scale: ${ Viewport.scale }`,10,40);
        viewportInfoContext.fillText(`fps: ${ Viewport.fps }`,10,55);
        viewportInfoContext.fillText(`View Cursor: ${ Viewport.mouseX },${ Viewport.mouseY }`,10,70);

        let mapX=  Math.round( Viewport.mouseX / Viewport.scale ) + Viewport.scrollX;
        let mapY=  Math.round( Viewport.mouseY / Viewport.scale ) + Viewport.scrollY;

        viewportInfoContext.fillText(`Map Cursor: ${mapX} , ${mapY}`,10,85);
        viewportInfoContext.fillText(`Scroll: ${Viewport.scrollX} , ${Viewport.scrollY}`,10,100);

    }
};

export { ViewportInfo };
