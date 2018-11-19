import { DebugPanel as Panel } from './lib/debug-panel/debug-panel.js';
import { Sprites } from './tab-sprites/tab.js';


const Editor = {
    canvas : undefined,
    context : undefined,
    img : new Image(),
    Tileset : {
        width:undefined,
        height:undefined,
        file:undefined,
        Sprites : []
    },
    mouse : [0,0],
    render : function(){

        Editor.context.clearRect(0,0, Editor.context.width, Editor.context.height);
        Editor.context.beginPath();
        Editor.context.drawImage(Editor.img,0,0);

        let spaceX=100;
        let spaceY=100;

        Editor.context.strokeStyle  = 'gray';
        for(let x = 0; x < Editor.canvas.width/spaceX; x++){
            Editor.context.moveTo(x*spaceX,0);
            Editor.context.lineTo(x*spaceX,Editor.canvas.height);
            Editor.context.stroke();
        }
        for(let y = 0; y < Editor.canvas.height/spaceY; y++){
            Editor.context.moveTo(0,y*spaceY);
            Editor.context.lineTo(Editor.canvas.width,y*spaceY);
            Editor.context.stroke();
        }

        // draw sprite rect on mouse coords
        if(Sprites.data.length){
            Editor.context.strokeStyle  = 'red';
            Editor.context.strokeRect(
                Editor.mouse[0],
                Editor.mouse[1],
                Sprites.data[Sprites.currentSprite].width,
                Sprites.data[Sprites.currentSprite].height
            );
        }

        for(let sprite=0; sprite<Editor.Tileset.Sprites.length; sprite++){
            for(let frame=0; frame<Editor.Tileset.Sprites[sprite].frames.length; frame++){
                let x = Editor.Tileset.Sprites[sprite].frames[frame][0];
                let y = Editor.Tileset.Sprites[sprite].frames[frame][1];
                let w = Editor.Tileset.Sprites[sprite].width;
                let h = Editor.Tileset.Sprites[sprite].height;

                if( sprite !== Sprites.currentSprite ) Editor.context.strokeStyle  = 'grey';
                else if( frame !== Sprites.currentFrame ) Editor.context.strokeStyle  = 'lightgreen';
                else Editor.context.strokeStyle  = 'green';
                Editor.context.strokeRect(x,y,w,h);
            }
        }
        requestAnimationFrame(Editor.render);
    },
    init : function(){
        this.canvas = document.getElementById('tilemap-canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.addEventListener('mousemove' , e=>{
            this.mouse[0]=e.offsetX;
            this.mouse[1]=e.offsetY;
        });
        this.img = new Image();

        Panel.loadStyles( 'panel-style.css');

        Panel.Register.tab( 'Tilemap', async ()=>{} );
        Sprites.Tab.register();

        Panel.addFeature.action.fileOpen(
            e=>{
                let file = e.target.files[0];
                let reader = new FileReader();
                // Read in the image file as a data URL.
                reader.readAsDataURL(file);
                reader.onload = (evt)=>{
                    if( evt.target.readyState == FileReader.DONE) {
                        this.img.src = evt.target.result;
                        this.img.onload=()=>{
                            this.canvas.width= this.img.width;
                            this.canvas.height= this.img.height;
                            this.render();
                            Sprites.data = Editor.Tileset.Sprites;

                            Panel.enableTab(Sprites.Tab.id);

                        };
                    }
                };
            },
            {accept:'.png'}
        );
        delete this.init;
    }
};

Editor.init();

let tabConstructor = async function(viewport){
    let html = `
        <div id="config-tab">
            <div id="">
                <div>Grid</div>
                <div>Show Grid</div>
                <div>w : <input type="number" value="50"></div>
                <div>h : <input type="number" value="50"></div>
                <div>Grid Snap</div>
                <div></div>
            </div>
            <div id="">
                <div>Spritemap</div>
                <div>Show collision mask</div>
                <div>Show pivot point</div>
                <div>Show sprite id</div>
                <div></div>
            </div>
        </div>
    `;
    viewport.innerHTML=html;
};

Panel.Register.tab( 'Config', tabConstructor);

export { Editor };
