/*
* @Author: colxi
* @Date:   2018-08-14 12:50:51
* @Last Modified by:   colxi
* @Last Modified time: 2018-11-11 23:16:36
*/

import { Selector } from './debug-panel-selector.js';

import { Styles } from './debug-panel-css.js';
import { ExtendedStyles } from './debug-panel-css-extended.js';


// ensure the document body is heitht 100%
document.documentElement.style = 'height:100%;'; // html elememt
document.body.style            = 'height:100%; margin: 0px;'; // body elememt

const panelHTML =`
    <style id="debuggerPanel-styles"></style>
    <style id="debuggerPanel-extended-styles"></style>
    <style id="debuggerPanel-custom-styles"></style>
    <div id="debuggerPanel-menu">
        <span id="debuggerPanel-menu-actions-container"></span>
        <span id="debuggerPanel-menu-tabs-container"></span>
        <span id="debuggerPanel-menu-dialog-container">
            <span id="debuggerPanel-menu-dialog-button">»</span>
            <span id="debuggerPanel-menu-dialog-box"></span>
            <div id="debuggerPanel-menu-dialog-background"></div>
        </span>
        <span id="debuggerPanel-menu-fold-button">▼</span>
    </div>
    <div id ="debuggerPanel-tab-viewport"></div>
`;

const panelResizerCss = `
    left: 0px;
    right: 0px;
    top: 0;
    background: transparent;
    height: 5px;
    cursor: ns-resize;
    position: relative;
    border-bottom:2px solid #01ea01
`;

const outterContainerCss = `
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    height: 200px;
    transition: 0s;
`;

const panelDocumentStyles = `
    [debugger-focus]{
        border:1px solid blue;
        background-color:rgba(0,0,255,.2);
    }
`;

const Panel = function( target , fixed=false){
    let outterContainer;

    if(target){
        outterContainer = document.querySelector( target );
    }else{
        outterContainer            = document.createElement('div');
        outterContainer.id         = 'debuggerPanel-outter-container';
        outterContainer.style      = outterContainerCss;
        document.body.appendChild(outterContainer);
    }

    outterContainer.innerHTML  = '';
    outterContainer.innerHTML += '<div id="debuggerPanel-resize" style="'+ panelResizerCss +'"></div>';
    outterContainer.innerHTML += '<style>'+panelDocumentStyles+'</style>';
    outterContainer.innerHTML += '<div id="debuggerPanel-viewport"></div>';

    const innerContainer         = outterContainer.querySelector('#debuggerPanel-viewport').attachShadow({mode: 'open'});
    innerContainer.innerHTML     = panelHTML;

    const resizeBar              = outterContainer.querySelector('#debuggerPanel-resize');

    const styleTag               = innerContainer.querySelector('#debuggerPanel-styles');
    const styleExtendedTag       = innerContainer.querySelector('#debuggerPanel-extended-styles');
    const styleCustomTag         = innerContainer.querySelector('#debuggerPanel-custom-styles');

    const menu                   = innerContainer.querySelector('#debuggerPanel-menu');
    const menuActionsContainer   = menu.querySelector('#debuggerPanel-menu-actions-container');
    const menuTabsContainer      = menu.querySelector('#debuggerPanel-menu-tabs-container');
    const menuFoldButton         = menu.querySelector('#debuggerPanel-menu-fold-button');
    const menuDialogContainer    = menu.querySelector('#debuggerPanel-menu-dialog-box');
    const menuDialogButton       = menu.querySelector('#debuggerPanel-menu-dialog-button');
    const menuDialogBackground   = menu.querySelector('#debuggerPanel-menu-dialog-background');

    const tabViewport            = innerContainer.querySelector('#debuggerPanel-tab-viewport');



    let isPanelResizing          = false;
    let isPanelUnfolded          = true;
    var panelLastHeight          = 300;

    //
    // SET STYLES
    //
    styleTag.innerHTML           = Styles;
    styleExtendedTag.innerHTML   = ExtendedStyles;

    //
    // RESIZING CAPABILITY
    //
    resizeBar.addEventListener('mousedown',  ()=> {
        outterContainer.style.transition='0s';
        isPanelUnfolded             = true;
        menuFoldButton.innerHTML    = '▼ ';
        isPanelResizing             = true;
    });
    document.addEventListener( 'mousemove' , e=> {
        if (!isPanelResizing) return;
        let cursorY= (e.clientY < -6) ? -6 : e.clientY ;
        var offsetTop = document.body.clientHeight - (cursorY - document.body.offsetTop);
        outterContainer.style.height = offsetTop + 'px';
    });
    document.addEventListener( 'mouseup',  ()=> isPanelResizing = false );


    //
    // FOLD BUTTON CLICK HANDLER
    //
    menuFoldButton.addEventListener('click', ()=>{
        outterContainer.style.transition='.5s';
        if(isPanelUnfolded) Debug.fold();
        else  Debug.unfold();
    });


    //
    //  TABS CONTEXT-DIALOG HQNDLER & MENU ICONS ADJUSTMENT
    //
    menuDialogButton.addEventListener('click', ()=>{
        var style = window.getComputedStyle(menuDialogContainer);
        if(style.display === 'none'){
            menuDialogContainer.style.display  = 'block';
            menuDialogBackground.style.display = 'block';
        }
    });
    menuDialogBackground.addEventListener('click' , ()=>{
        menuDialogBackground.style.display  ='none';
        menuDialogContainer.style.display   ='none';
    });

    const adjustMenu = function(){
        Array.from(menuDialogContainer.children).forEach(i=>{
            menuTabsContainer.appendChild(i);
        });

        let width = menu.offsetWidth;
        let actionsWidth = menuActionsContainer.offsetWidth;
        let availableWidth = width - actionsWidth - 120;

        let menuTabs = Array.from( menuTabsContainer.children );
        menuTabs.forEach(i=>{
            availableWidth = availableWidth - i.offsetWidth;
            if( availableWidth < 0)  menuDialogContainer.appendChild(i);
        });
    };
    window.addEventListener( 'resize' , adjustMenu );


    //
    // Public API
    //
    const Debug = {
        get height(){ return outterContainer.offsetHeight },
        set height( h ){
            h = Number(h);
            outterContainer.style.height = panelLastHeight = h;
            return true;
        },
        currentTab : 'expressions',
        tabs:{},
        Register : {
            action: function( title='', icon , callback, className='' ){
                let button = document.createElement('span');
                button.className= 'debuggerPanel-menu-element debuggerPanel-menu-action '+ className;
                button.setAttribute('title', title);
                button.innerHTML = icon;
                button.addEventListener('click', callback);
                menuActionsContainer.appendChild(button);
                setTimeout( adjustMenu, 100);
                return true;
            },
            tab : function( label , callback ){
                let id = label.toLowerCase().split(' ').join('-');
                Debug.tabs[id]= callback;

                let tabButton       = document.createElement('span');
                tabButton.className = 'debuggerPanel-menu-element';
                tabButton.id        = 'debuggerPanel-menu-item-' + id;

                tabButton.innerHTML = label;
                tabButton.addEventListener( 'click', () => Debug.openTab(id) );
                menuTabsContainer.appendChild(tabButton);
                setTimeout( adjustMenu, 100);

                if(Object.keys(Debug.tabs).length===1) Debug.openTab(id);
                return id;
            },
        },
        addFeature: {
            tab : {
                DOMSelector : function(){
                    Debug.Register.tab('Selector', Selector);
                }
            },
            action: {
                fileOpen : function(callback, configObj){
                    let button = document.createElement('span');
                    button.className= 'debuggerPanel-menu-element debuggerPanel-menu-action';
                    button.setAttribute('title', 'Open file');
                    button.innerHTML = '<input type="file" id="panelMenuFileOpen"><label for="panelMenuFileOpen">📂</label>';
                    menuActionsContainer.appendChild(button);
                    let input = menu.querySelector('#panelMenuFileOpen');
                    Object.keys(configObj).forEach( key=> input.setAttribute( key,configObj[key] ) );
                    input.addEventListener('change',callback);
                    setTimeout( adjustMenu, 100);
                    return true;
                }
            },
        },
        fold: function(){
            menuFoldButton.innerHTML        = '▲ ';
            panelLastHeight                 = outterContainer.offsetHeight;
            isPanelUnfolded                 = false;
            outterContainer.style.height    = '41px';
            return true;
        },
        unfold: function(){
            menuFoldButton.innerHTML        = '▼ ';
            outterContainer.style.height    = panelLastHeight+'px';
            isPanelUnfolded                 = true;
            return true;
        },
        enableTab: function(tabId=''){
            let tab = menuTabsContainer.querySelector('#debuggerPanel-menu-item-'+tabId);
            if(!tab) return false;
            tab.removeAttribute('disabled');
            return true;
        },
        disableTab: function(tabId=''){
            let tab = menuTabsContainer.querySelector('#debuggerPanel-menu-item-'+tabId);
            if(!tab) return false;
            tab.setAttribute('disabled','true');
            return true;
        },
        openTab: function(t , args){
            t = (typeof t !== 'undefined') ? t : Debug.currentTab;
            Debug.currentTab = t;
            const menuItems = menuTabsContainer.querySelectorAll('.debuggerPanel-menu-element');
            const tabButton = menuTabsContainer.querySelector('#debuggerPanel-menu-item-'+t);

            Array.from(menuItems).forEach( i=> i.removeAttribute('active') );
            if(tabButton) tabButton.setAttribute('active',true);

            tabViewport.setAttribute('tab', Debug.currentTab);

            Debug.tabs[t]( tabViewport , args);

            menuDialogBackground.style.display = 'none';
            menuDialogContainer.style.display  = 'none';
        },
        updateTab :function(args){
            Debug.openTab( undefined, args);
        },

        setStyles: function(styles){
            styleCustomTag.innerHTML = styles;
        },
        loadStyles: function(styleUrl){
            let styles = document.createElement('link');
            styles.setAttribute('rel', 'stylesheet');
            styles.setAttribute('href', styleUrl);
            innerContainer.appendChild( styles );
        }
    };

    return Debug;
};


let myPanel = new Panel('#myPanel');
window.DebugPanel = myPanel;

export { myPanel as DebugPanel };
