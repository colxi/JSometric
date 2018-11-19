/*
* @Author: colxi
* @Date:   2018-08-14 19:51:28
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-31 19:51:17
*/

const ExtendedStyles = `

    #debuggerPanel-tab-selector-input{
        margin: auto;
        display: block;
        background: #3a3939;
        border: 1px solid grey;
        padding: 8px;
        margin-top: 20px;
        width: 80%;
        border-radius: 3px;
        color: white;
        text-align: center;
    }

    [ltd-selected]{ background:blue; }

    [ltd-dom-templated]{ border:1px dashed grey;  }


    #debuggerPanel-tab-viewport table{
        width: 100%;
        /*
        border-spacing:0;
        */
        margin-top: 15px;

        border-collapse: separate;
        border-spacing: 0px 8px;
    }

    table tr:hover {
        background:#444343 !important;
    }

    table tr:nth-child(even) {
        background:  #2d2c2c;
    }

    #debuggerPanel-tab-viewport table td{
        padding: 6px;
        line-height: 17px;
        padding-left: 15px;
        padding-right: 15px;
    }



    #ltd-tab-elements table td:first-child{ width: 100px; }
    #ltd-tab-placeholders table td:first-child{ width: 200px; }
    #ltd-tab-expressions table td:first-child{ width: 450px !important; }



    .lt-type-expression{
        color: var(--color-light-green);
        display: inline;
        word-break: break-all;
    }
    .lt-type-expression:hover,
    .lt-type-expression:hover::after,
    .lt-type-expression:hover::before{
        color: var(--color-lighter-green) !important;;
    }
    .lt-type-expression::before{
        content: '{{';
        padding: 4px;
        margin: 2px;
        font-size: 10px;
        color:grey;
    }
    .lt-type-expression::after{
        content: '}}';
        padding: 4px;
        margin: 2px;
        font-size: 10px;
        color:grey;
    }


    .lt-type-identifier{
        color: var(--color-dark-yellow);
        display: inline;
        word-break: break-all;
    }
    .lt-type-identifier::before{
        content: '#';
        padding: 4px;
        margin: 2px  0px;
        font-size: 12 px;
        color:grey;
    }


    .lt-type-element{
        color: var(--color-light-blue);
        display: inline;
        word-break: break-all;
        margin:0px 2px;
    }
    .lt-type-element:hover,
    .lt-type-element:hover::after,
    .lt-type-element:hover::before{
        color: var(--color-lighter-blue) !important;;
    }
    .lt-type-element::before{
        content: '<';
        padding: 4px 0;
        font-size: 10px;
        color:grey;
    }
    .lt-type-element::after{
        content: '>';
        padding: 4px 0;
        font-size: 10px;
        color:grey;
    }


    .lt-type-attribute{
        color: var(--color-dark-blue);
        display: inline;
        word-break: break-all;
    }
    .lt-type-attribute::before{
        content: '[[Attribute]] : ';
        padding: 4px 0px;
        margin: 2px  1px;
        font-size: 12px;
        color:grey;
    }



    .lt-type-nodeValue{
        color: var(--color-dark-blue);
        display: inline;
        word-break: break-all;
    }
    .lt-type-nodeValue::before{
        content: '[[NodeValue]] :';
        padding: 4px 0px;
        margin: 2px  0px;
        font-size: 12px;
        color:grey;
    }



    .lt-type-text{
        color: var(--color-light-red);
        display: inline;
        word-break: break-all;
    }
    .lt-type-text::before,
    .lt-type-text::after{
        content: '"';
        padding: 4px;
        margin: 2px  0px;
        font-size: 12px;
        color:grey;
    }

`;

export { ExtendedStyles };









