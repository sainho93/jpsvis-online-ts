import * as PIXI from 'pixi.js';
import * as Rainbow from 'rainbowvis.js';

class Pedestrian2D {
  constructor (trajData, probs, frame) {
    this.trajData = trajData;
    this.probs = probs;
    this.frame = Math.floor(frame/8);

    this.pedestrians = new PIXI.Container();

    this.IDs = new PIXI.Container();

  }

  addPedestrians(){
    for(let i=0; i<this.trajData.pedestrians.length; i++){
      if(this.frame < this.trajData.pedestrians[i].length){
        if(this.probs.showPedestrian){
          const colorId = Math.floor(this.trajData.pedestrians[i][this.frame].color / 255 * 100);
          const rainbow = new Rainbow();
          const colorHex = '0x' + rainbow.colorAt(colorId);

          const pedestrian = new PIXI.Graphics();

          pedestrian.beginFill(Number(colorHex), 0.7);
          pedestrian.lineStyle(0.5, 0x000000, 1);

          const x = this.trajData.pedestrians[i][this.frame].coordinate.x
            * this.probs.scale + this.probs.offsetX;
          const y = - (this.trajData.pedestrians[i][this.frame].coordinate.y
            * this.probs.scale + this.probs.offsetY);
          const major_axes = this.trajData.pedestrians[i][this.frame].axes.A * this.probs.scale/2;
          const minor_axes = this.trajData.pedestrians[i][this.frame].axes.B * this.probs.scale/2;
          const angle = this.trajData.pedestrians[i][this.frame].angle;

          pedestrian.drawEllipse(0,0,2 * major_axes, 2 * minor_axes);

          pedestrian.angle = - angle;

          pedestrian.x = x - major_axes;
          pedestrian.y = y - minor_axes;

          pedestrian.endFill();

          this.pedestrians.addChild(pedestrian);
        }
      }
    }
  }

  addIDs(){
    for(let i=0; i<this.trajData.pedestrians.length; i++){
      if(this.frame < this.trajData.pedestrians[i].length){
        if(this.probs.showID){
          const x = this.trajData.pedestrians[i][this.frame].coordinate.x
            * this.probs.scale + this.probs.offsetX;
          const y = - (this.trajData.pedestrians[i][this.frame].coordinate.y
            * this.probs.scale + this.probs.offsetY);
          const minor_axes = this.trajData.pedestrians[i][this.frame].axes.B * this.probs.scale/2;

          let ID = new PIXI.Text(this.trajData.pedestrians[i][this.frame].id)
          ID.position.set(x,y);
          ID.style = {fontSize: "4"};

          this.IDs.addChild(ID);
        }
      }
    }
  }


  getPedestrian(){
    return this.pedestrians;
  }

  getIDs(){
    return this.IDs
  }
}


export default Pedestrian2D;
