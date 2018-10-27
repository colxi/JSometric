/*
* @Author: colxi
* @Date:   2018-10-24 09:55:33
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-27 13:35:22
*/

const Jsometric = {};

Jsometric.retrieveCanvas = async function( id ){
    return await Jsometric.Request('canvas', [id]);
}

Jsometric.getWindowSize = async function(){
    return await Jsometric.Request('getWindowSize');
}

importScripts( 'core-map.js' );
importScripts( 'core-tileset.js' );
importScripts( 'core-renderer.js' );
importScripts( 'core-viewport.js' );
importScripts( 'core-request.js' );
importScripts( 'core-events.js' );

importScripts( '../myGame.js' );


let _onAnimationFrame= function(){};
