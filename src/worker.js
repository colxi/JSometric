/*
* @Author: colxi
* @Date:   2018-10-24 09:55:33
* @Last Modified by:   colxi
* @Last M odified time: 2018-10-29 23:43:36
*/

function isAbsolutePath(pathname){
    pathname = pathname.toLowerCase();
    if( pathname[0] === '/' ||
        pathname.substring(0,7) === 'http://' ||
        pathname.substring(0,8) === 'https://'
    ) return true;
    else return false;
}

const Jsometric = {};

// Detect Library directory base url
let LIB_BASE_URL = self.location.pathname.split('/');
LIB_BASE_URL.splice(-2);
LIB_BASE_URL = LIB_BASE_URL.join('/') + '/';

// detect uer script directory base url
let BASE_URL    = self.location.search.split('?pathname=')[1].split('&filename=')[0];
let USER_SCRIPT = self.location.search.split('&filename=')[1];

// Load library components
console.log('[worker]: Loading library components...');
importScripts( LIB_BASE_URL+'worker-map.js' );
importScripts( LIB_BASE_URL+'worker-tileset.js' );
importScripts( LIB_BASE_URL+'worker-viewport.js' );
importScripts( LIB_BASE_URL+'worker-request.js' );
importScripts( LIB_BASE_URL+'worker-events.js' );

// Load user script
console.log('[worker]: Loading user Script... ('+ (isAbsolutePath(USER_SCRIPT) ? USER_SCRIPT : BASE_URL+USER_SCRIPT) +')');
importScripts( isAbsolutePath(USER_SCRIPT) ? USER_SCRIPT : BASE_URL+USER_SCRIPT );


