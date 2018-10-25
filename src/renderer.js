/*
* @Author: colxi
* @Date:   2018-10-24 09:55:33
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-24 17:04:59
*/


onmessage = function(msg) {
    Viewport[msg.data.type]( msg.data.data );
    //postMessage({ image: processedImage });
};

const Viewport = {
    width: 0,
    height:0,
    canvas : null,
    context: null,
    create : function(canvas){
        this.canvas  = canvas;
        this.context = this.canvas.getContext('2d');
        this.width= this.canvas
        this.height= this.canvas;
        console.log(canvas)
        requestAnimationFrame(this.loop);

    },
    resize : function(){

    },
    loop: function(){
        Viewport.context.clearRect(0, 0, this.width, this.height);
        Viewport.context.rect(100, 100, 20, 80);
        Viewport.context.stroke();

       // let bmp = Viewport.context.transferToImageBitmap;
        requestAnimationFrame(Viewport.loop);
    }
}

