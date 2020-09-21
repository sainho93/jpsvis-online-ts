import * as PIXI from 'pixi.js';
import {colors} from './colors';


class Pedestrian2D {
  constructor (trajData, probs, frame) {
    this.trajData = trajData;
    this.probs = probs;
    this.frame = Math.floor(frame/8);

    this.pedestrians = new PIXI.Container();

  }

  addPedestrians(){
    for(let i=0; i<this.trajData.pedestrians.length; i++){
      if(this.frame < this.trajData.pedestrians[i].length){
        if(this.probs.showPedestrian){
          const colorId = this.trajData.pedestrians[i][this.frame].color
          const colorHex = '0x' + colors[colorId].hexString.split('#')[1];

          const pedestrian = new PIXI.Graphics();
          pedestrian.beginFill(colorHex, 0.7);
          pedestrian.lineStyle(0.5, 0x000000, 1);

          const x = this.trajData.pedestrians[i][this.frame].coordinate.x
            * this.probs.scale + this.probs.offsetX;
          const y = this.trajData.pedestrians[i][this.frame].coordinate.y
            * this.probs.scale + this.probs.offsetY;
          const major_axes = this.trajData.pedestrians[i][this.frame].axes.A
            * this.probs.scale;
          const minor_axes = this.trajData.pedestrians[i][this.frame].axes.B
            * this.probs.scale;
          const angle = this.trajData.pedestrians[i][this.frame].angle;

          pedestrian.drawEllipse(x - major_axes,y - minor_axes
            , 2 * major_axes, 2 * minor_axes);

          pedestrian.endFill();
          this.pedestrians.addChild(pedestrian);
        }
      }
    }
  }


  getPedestrian(){
    return this.pedestrians;
  }
}


export default Pedestrian2D;
