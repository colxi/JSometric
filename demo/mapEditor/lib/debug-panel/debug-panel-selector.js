/*
* @Author: colxi
* @Date:   2018-08-14 12:50:51
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-30 11:58:57
*/

import { DebugPanel as Debug } from './debug-panel.js';

const Selector = function(viewport){
    let html = '';
    html += `
        <div>
            <input type="text" id="debuggerPanel-tab-selector-input">
            <table id="debuggerPanel-tab-selector-results">
            </table>
        </div>
    `;
    viewport.innerHTML = html;

    let resultsTable = viewport.querySelector( '#debuggerPanel-tab-selector-results' );
    let elements = {};

    viewport.querySelector('#debuggerPanel-tab-selector-input').addEventListener('input', e=>{
        elements = {};
        resultsTable.innerHTML='';
        let queryResults;

        try{ queryResults = document.querySelectorAll( e.target.value );
        }catch(e){ return false }

        let r = '';
        Array.from( queryResults ).forEach( (i,index)=>{
            if (i.id==='debuggerPanel-outter-container') return;
            if (i.id==='debuggerPanel-resize') return;
            if (i.id==='debuggerPanel-viewport') return;

            elements[index]=i;
            r += '<tr>';
            r +=    '<td> <div data-index="'+index+'" class="result">';
            r +=        '&lt;'+i.tagName.toLowerCase();
            if(i.id){
                r+= ' id="' + i.id + '"';
            }
            if(i.hasAttribute('class')){
                r+= ' class="' + i.className + '"';
            }
            r +=        '&gt;';
            r +=    '</div></td>';
            r += '</tr>';
        });
        resultsTable.innerHTML= r;

        // add event listeners ti each table result
        Array.from( resultsTable.querySelectorAll('.result') ).forEach(tableEntry=>{
            tableEntry.addEventListener('mouseover', f=>{
                elements[f.target.dataset.index].setAttribute('debugger-focus','true');
            });
            tableEntry.addEventListener('mouseout', f=>{
                elements[f.target.dataset.index].removeAttribute('debugger-focus');
            });
            tableEntry.addEventListener('click', f=>{
                console.log(elements[f.target.dataset.index]);
            });
        });
    });
};

export { Selector };
