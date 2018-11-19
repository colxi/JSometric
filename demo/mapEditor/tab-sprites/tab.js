import { DebugPanel as Panel } from '../lib/debug-panel/debug-panel.js';
import { Editor } from '../editor-core.js';


/**
 * [description]
 * @param  {[type]} viewport [description]
 * @return {[type]}          [description]
 */
let tabConstructor = async function(viewport){
    let html = `
        <div id="sprites-tab">
            <div id="spriteSideMenu">
                <div class="button" id="newSpriteButton">New sprite</div>
                <div id="spriteListOutter">
                    <div>
                        <div>Walk</div>
                        <div>Jump</div>
                        <div>Something</div>
                        <div>Test</div>
                        <div>Test</div>
                        <div>Test</div>
                        <div>Test</div>
                        <div>Test</div>
                        <div>Test</div>
                        <div>Test</div>
                        <div>Test</div>
                        <div>Test</div>
                        <div>Test</div>
                        <div>Test</div>
                        <div>Test</div>
                        <div>Test</div>
                        <div>Test</div>
                        <div>Test</div>
                        <div>Test</div>
                    </div>
                </div>
            </div>
            <div id="spritesEditor">
                <div id="spriteData">
                    <input type="text"  id="spriteName"> <br>
                    w: : <input type="number" id="spriteWidth">
                    h : <input type="number" id="spriteHeight">
                </div>
                <div id="spritePreviewContainer">
                    <div class="button" id="spritePreviewUp" title="Press Shift for bigger steps">▲</div>
                    <div id="spritePreviewMidleRow">
                        <div class="button" id="spritePreviewLeft" title="Press Shift for bigger steps">◄</div>
                        <canvas id="preview"></canvas>
                        <div class="button" id="spritePreviewRight" title="Press Shift for bigger steps">►</div>
                    </div>
                    <div class="button" id="spritePreviewDown" title="Press Shift for bigger steps">▼</div>
                </div>
                <div id="spriteFrames">
                    <div class="button-circle" id="spriteFrameAdd" title="Press Alt to clone">+</div>
                    <div>
                        <span class="button" id="spriteFramePrev">◄</span>
                        <span >Frame <span id="spriteCurrentFrame"></span>/<span id="spriteTotalFrames"></span></span>
                        <span class="button"  id="spriteFrameNext">►</span>
                    </div>
                    <div id="spriteFrameCoords">
                        x : <input type="number" id="frameX" > <br>
                        y : <input type="number" id="frameY" >
                    </div>
                    <div class="button-circle" id="spriteFrameRemove">🗑</div>
                </div>
            </div>
        </div>
    `;

    Panel.height    = 370;

    Sprites.Tab.viewport           = viewport;
    Sprites.Tab.viewport.innerHTML = html;
    Sprites.canvas  = Sprites.Tab.viewport.querySelector('#preview');
    Sprites.context = Sprites.canvas.getContext('2d');

    // name
    Sprites.Tab.viewport.querySelector('#spriteName').addEventListener('input', async e=>{
        Sprites.data[Sprites.currentSprite].name = e.target.value;
        await Sprites.Tab.update();
    });

    // width
    Sprites.Tab.viewport.querySelector('#spriteWidth').addEventListener('input', async e=>{
        Sprites.data[Sprites.currentSprite].width = Number(e.target.value);
        await Sprites.createImageData( Sprites.currentSprite , '*', true);
        await Sprites.Tab.update();
    });
    // height
    Sprites.Tab.viewport.querySelector('#spriteHeight').addEventListener('input', async e=>{
        Sprites.data[ Sprites.currentSprite ].height = Number(e.target.value);
        await Sprites.createImageData( Sprites.currentSprite , '*', true);
        await Sprites.Tab.update();
    });

    // X
    Sprites.Tab.viewport.querySelector('#frameX').addEventListener('input', async e=>{
        Sprites.data[ Sprites.currentSprite ].frames[ Sprites.currentFrame ][0] = Number(e.target.value);
        await Sprites.createImageData( Sprites.currentSprite , Sprites.currentFrame, true);
        await Sprites.Tab.update();
    });
    // Y
    Sprites.Tab.viewport.querySelector('#frameY').addEventListener('input', async e=>{
        Sprites.data[ Sprites.currentSprite ].frames[ Sprites.currentFrame ][1] = Number(e.target.value);
        await Sprites.createImageData( Sprites.currentSprite , Sprites.currentFrame, true);
        await Sprites.Tab.update();
    });

    // decrease Y
    Sprites.Tab.viewport.querySelector('#spritePreviewUp').addEventListener('mousedown', async (e)=>{
        let modifier= e.shiftKey ? 10 : 1;
        Sprites.Tab.viewport.querySelector('#frameY').value = Sprites.data[ Sprites.currentSprite ].frames[ Sprites.currentFrame ][1] -= modifier;
        await Sprites.createImageData( Sprites.currentSprite , Sprites.currentFrame, true);
        await Sprites.Tab.update();
    });
    // increase Y
    Sprites.Tab.viewport.querySelector('#spritePreviewDown').addEventListener('mousedown', async (e)=>{
        let modifier = e.shiftKey ? 10 : 1;
        Sprites.Tab.viewport.querySelector('#frameY').value = Sprites.data[ Sprites.currentSprite ].frames[ Sprites.currentFrame ][1] += modifier;
        await Sprites.createImageData( Sprites.currentSprite , Sprites.currentFrame, true);
        await Sprites.Tab.update();
    });
    // decrease X
    Sprites.Tab.viewport.querySelector('#spritePreviewLeft').addEventListener('mousedown', async (e)=>{
        let modifier= e.shiftKey ? 10 : 1;
        Sprites.Tab.viewport.querySelector('#frameX').value = Sprites.data[ Sprites.currentSprite ].frames[ Sprites.currentFrame ][0] -= modifier;
        await Sprites.createImageData( Sprites.currentSprite , Sprites.currentFrame, true);
        await Sprites.Tab.update();
    });
    // increase X
    Sprites.Tab.viewport.querySelector('#spritePreviewRight').addEventListener('mousedown', async (e)=>{
        let modifier= e.shiftKey ? 10 : 1;
        Sprites.Tab.viewport.querySelector('#frameX').value = Sprites.data[ Sprites.currentSprite ].frames[ Sprites.currentFrame ][0] += modifier;
        await Sprites.createImageData( Sprites.currentSprite , Sprites.currentFrame, true);
        await Sprites.Tab.update();
    });

    // Add frame (or clone)
    Sprites.Tab.viewport.querySelector('#spriteFrameAdd').addEventListener('mousedown', async (e)=>{
        let coords = ! e.altKey ?
            [0,0] :
            [ Sprites.data[ Sprites.currentSprite ].frames[Sprites.currentFrame][0] , Sprites.data[ Sprites.currentSprite ].frames[Sprites.currentFrame][1] ] ;

        if( Sprites.currentFrame === Sprites.data[ Sprites.currentSprite ].frames.length-1 ){
            Sprites.data[ Sprites.currentSprite ].frames.push( coords);
        }else{
            Sprites.data[ Sprites.currentSprite ].frames.splice( Sprites.currentFrame+1, 0, coords );
            Sprites.data[ Sprites.currentSprite ].framesData.splice( Sprites.currentFrame+1, 0, undefined);
        }
        Sprites.currentFrame++;
        await Sprites.createImageData( Sprites.currentSprite , Sprites.currentFrame, true);
        await Sprites.Tab.update();
    });

    // Previous frame
    Sprites.Tab.viewport.querySelector('#spriteFramePrev').addEventListener('mousedown', async ()=>{
        if( Sprites.currentFrame > 0 ) Sprites.currentFrame--;
        await Sprites.Tab.update();
    });
    // Next Frame
    Sprites.Tab.viewport.querySelector('#spriteFrameNext').addEventListener('mousedown', async ()=>{
        if( Sprites.currentFrame < Sprites.data[ Sprites.currentSprite ].frames.length -1) Sprites.currentFrame++;
        await Sprites.Tab.update();
    });

    Editor.canvas.onclick = async(e)=>{
        Sprites.data[ Sprites.currentSprite ].frames[ Sprites.currentFrame ][0] = e.offsetX;
        Sprites.data[ Sprites.currentSprite ].frames[ Sprites.currentFrame ][1] = e.offsetY;
        await Sprites.createImageData ( Sprites.currentSprite, Sprites.currentFrame);
        Sprites.Tab.update();
    };

    await Sprites.add('walk', 50, 100, [ [125,10], [190,10], [245,10] , [295,10]]);

    await Sprites.Tab.update();
};


const Sprites = {
    data          : [],
    canvas        : undefined,
    context       : undefined,
    currentSprite : 0,
    currentFrame  : 0,
    /**
     * [Tab description]
     * @type {Object}
     */
    Tab :{
        id : undefined,
        viewport : undefined,
        /**
         * [update description]
         * @return {[type]} [description]
         */
        update : function(){
            Sprites.Tab.viewport.querySelector('#frameX').value = Sprites.data[ Sprites.currentSprite ].frames[ Sprites.currentFrame ][0];
            Sprites.Tab.viewport.querySelector('#frameY').value = Sprites.data[ Sprites.currentSprite ].frames[ Sprites.currentFrame ][1];
            Sprites.Tab.viewport.querySelector('#spriteWidth').value = Sprites.data[ Sprites.currentSprite ].width;
            Sprites.Tab.viewport.querySelector('#spriteHeight').value = Sprites.data[ Sprites.currentSprite ].height;
            Sprites.Tab.viewport.querySelector('#spriteName').value = Sprites.data[ Sprites.currentSprite ].name;
            Sprites.Tab.viewport.querySelector('#spriteCurrentFrame').innerHTML = Sprites.currentFrame+1;
            Sprites.Tab.viewport.querySelector('#spriteTotalFrames').innerHTML = Sprites.data[ Sprites.currentSprite ].frames.length;

            let width = Sprites.data[ Sprites.currentSprite ].width;
            let height= Sprites.data[ Sprites.currentSprite ].height;

            Sprites.context.width  =  width;
            Sprites.context.height =  height;
            Sprites.canvas.width   = width;
            Sprites.canvas.height  = height;

            Sprites.context.clearRect(0,0,width,height);

            Sprites.context.drawImage(
                Sprites.data[ Sprites.currentSprite ].framesData[ Sprites.currentFrame ],
                0,
                0,
                width,
                height,
            );
            return true;
        },
        /**
         * [description]
         * @return {[type]} [description]
         */
        register: async function(){
            Sprites.Tab.id = Panel.Register.tab( 'Sprites', tabConstructor);
            Panel.disableTab(Sprites.Tab.id);
        }
    },
    /**
     * [description]
     * @param  {[type]} name    [description]
     * @param  {[type]} width   [description]
     * @param  {[type]} height  [description]
     * @param  {[type]} sprites [description]
     * @return {[type]}         [description]
     */
    add : async function(name, width, height, sprites){
        let sprite = Sprites.data.length;
        Sprites.data[sprite] = {
            name   : 'walk',
            width  : width,
            height : height,
            frames : sprites,
            framesData : []
        };
        for(let frame=0; frame< Sprites.data[sprite].frames.length; frame++){
            //let data = await createImageBitmap(Editor.img, i[0], i[1], width, height );
            let data = await Sprites.createImageData( sprite , frame, false );
            Sprites.data[sprite].framesData[frame] = data[0];
        }
        console.log( Sprites.data[sprite] );
    },
    /**
     * [description]
     * @param  {[type]}  sprite [description]
     * @param  {[type]}  frame  [description]
     * @param  {Boolean} assign [description]
     * @return {[type]}         [description]
     */
    createImageData : async function( sprite , frame, assign=true ){
        console.log( 'generating image Data for frame', frame, 'of sprite' , sprite);

        let initialFrame;
        let lastFrame;

        if( frame === '*' ){
            initialFrame = 0;
            lastFrame    = Sprites.data[ sprite ].frames.length-1;
        }else{
            initialFrame = frame;
            lastFrame    = frame;
        }

        let width        = Sprites.data[ sprite ].width;
        let height       = Sprites.data[ sprite ].height;
        let data         = [];

        for(let i=initialFrame ; i<=lastFrame ; i++){
            let x        = Sprites.data[ sprite ].frames[ i ][0];
            let y        = Sprites.data[ sprite ].frames[ i ][1];
            let d        = await createImageBitmap(Editor.img, x, y, width, height );
            if(assign) Sprites.data[ sprite ].framesData[ i ] = d;
            data.push(d);
        }

        return data;
    }
};


export { Sprites };
