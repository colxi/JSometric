/*
* @Author: colxi
* @Date:   2018-08-14 19:51:28
* @Last Modified by:   colxi
* @Last Modified time: 2018-11-05 12:06:40
*/

const Styles = `
    :host{
        --color-light-gray: #cbcbcb;
        --color-light-blue: #03A9F4;
        --color-light-red: #ff5353;
        --color-light-green: #4fb94f;
        --color-light-yellow: #cccc00;

        --color-dark-yellow:  #d7bf02;
        --color-dark-blue: #0b8fca;

        --color-lighter-green: #79e179;
        --color-lighter-blue: #6cc8f1;
    }


    :host{
        background:#242424;
        font-family: monospace;
        color: var(--color-light-gray);
        cursor:default;
        box-sizing: content-box;
        overflow-y: hidden;
        height:100%;
    }


    /*  MENU & MENU-ELEMENTS */

    #debuggerPanel-menu{
        height: 34px;
        padding: 0px 5px;
        font-family: sans-serif;
        background: #3a3939;
        border-bottom: 1px solid #434242;
        border-top: 1px solid #565656;
        user-select: none;
    }

    #debuggerPanel-menu .debuggerPanel-menu-element {
        font-size: 14px;
        padding: 7px 10px;
        display: inline-block;
        color: #9a9a9a;
        cursor: pointer;
    }

    #debuggerPanel-menu .debuggerPanel-menu-element[active] {
        background: #212020;
        color: #e4e4e4;
    }

    #debuggerPanel-menu .debuggerPanel-menu-element[disabled] {
        pointer-events: none;
        opacity: .5;
    }

    #debuggerPanel-menu .debuggerPanel-menu-element:hover:not([active]) {
        background: #3c3c3c;
        color: #cecece;
    }


    /* MENU-ACTIONS */

    #debuggerPanel-menu-actions-container {
        border-right: 1px solid #565656;
        margin-left: 10px;
        margin-right: 10px;
    }

    #debuggerPanel-menu .debuggerPanel-menu-action {
        color: #e4e4e4 !important;
        font-size: 18px !important;
        line-height: 20px;
        min-width: 20px;
        text-align: center;
    }



    /* MENU DIALOG */

    #debuggerPanel-menu-dialog-container { position : relative; }

    #debuggerPanel-menu-dialog-box {
        position: absolute;
        background: #212020;
        left: -123px;
        float: left;
        z-index: 99999;
        margin-top: 5px;
        padding: 9px;
        border-radius: 5px;
        border: 1px solid #3f4042;
        display: none;
        width: 120px;
        text-align: center;
    }

    #debuggerPanel-menu-dialog-box:before {
        content: " ";
        border-style: solid;
        border-width: 10px 15px 10px 0;
        border-color: transparent #212020 transparent transparent;
        position: absolute;
        transform: rotate(90deg);
        top: -15px;
        right: 15px;
    }

    #debuggerPanel-menu-dialog-background{
        background: transparent;
        opacity:.5;
        width: 100%;
        top: -100px;
        position: relative;
        height: 9000px;
        z-index: 88888;
        display:none;
    }

    #debuggerPanel-menu-dialog-box .debuggerPanel-menu-element {display:block;}

    #debuggerPanel-menu-dialog-button{
        margin-left: 15px;
        font-size : 20px;
        cursor:pointer;
    }
    #debuggerPanel-menu-dialog-button:hover{ color:white; }



    /* MENU FOLD BUTTON */

    #debuggerPanel-menu-fold-button {
        border-left: 1px solid #535353;
        padding-left: 15px;
        margin-top: 10px;
        margin-right: 15px;
        z-index: 7777;
        position: absolute;
        right: 0px;
        color: #9a9a9a;
        top: 7px;
        font-size: 14px;
        cursor:pointer;
    }
    #debuggerPanel-menu-fold-button:hover{ color: white; }



    /* TAB */

    *::-webkit-scrollbar-track{
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
        background-color: transparent;
        border: 1px solid #2e2e2e
    }

    *::-webkit-scrollbar{
        width: 15px;
        background-color: transparent;
    }

    *::-webkit-scrollbar-thumb{
        background-color: #3a3939;
        border-left: 1px solid #484848;
        border-bottom: 1px solid #505050;
        border-top: 1px solid #505050;
        border-radius: 4px;
    }

    *::-webkit-scrollbar-button {
        display:none;
    }

    #debuggerPanel-tab-viewport{
        bottom: 0;
        position: absolute;
        top: 37px;
        overflow-y: auto;
        margin-top: 9px;
        left: 0px;
        right: 0px;
    }



    /* BUTTONS */

    #panelMenuFileOpen{ display:none}
    #panelMenuFileOpen+label{
        cursor:pointer;
        filter: grayscale(100%);
    }

`;

export { Styles };









