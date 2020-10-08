import * as PIXI from 'pixi.js';

class Geometry2D {
  constructor (geometryData, probs) {
    this.geometryData = geometryData;
    this.geometryGrapihc = new PIXI.Graphics();
    this.captions = new PIXI.Container();

    this.rooms = this.geometryData.geometry.rooms;
    this.transitions = this.geometryData.geometry.transitions;

    this.probs = probs;

    this.style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 1,
    });
  }

  addRooms(){
    for (let i = 0; i < this.rooms.room.length; i++){
      this.createRoom(this.rooms.room[i]);
    }
  }

  addTransitions(){
    if(typeof(this.transitions.transition) !== 'object'){
      for (let i = 0; i < this.transitions.transition.length; i++){
        this.createTransition(this.transitions.transition[i]); // If there are more than one transitions
      }
    }else {
      this.createTransition(this.transitions.transition)  // If there is only one transition
    }

  }

  createRoom(room){
    const polygons = room.subroom.polygon;

    // create caption
    if(this.probs.showCaption){
      const name = room.subroom.caption;

      let caption = new PIXI.Text(name);
      caption.style = {fontSize: "12"};
      const x = polygons[0].vertex[0].px * this.probs.scale;
      const y = - polygons[0].vertex[0].py * this.probs.scale;
      caption.position.set(x, y);
      this.captions.addChild(caption);
    }


    // create polygon
    for (let i = 0; i < polygons.length; i++){
      this.createPolygon(polygons[i])
    }
  }


  createTransition(transition){
    this.createLine(transition, 0x2CAEBE)
  }

  createPolygon(polygon){
    this.createLine(polygon, 0x000000)
  }

  createLine(element, color){
    const point1x = parseFloat(element.vertex[0].px) * this.probs.scale + this.probs.offsetX ;
    const point1y = - (parseFloat(element.vertex[0].py) * this.probs.scale + this.probs.offsetY);
    const point2x = parseFloat(element.vertex[1].px) * this.probs.scale + this.probs.offsetX ;
    const point2y = - (parseFloat(element.vertex[1].py) * this.probs.scale + this.probs.offsetY);

    this.geometryGrapihc.beginFill();
    this.geometryGrapihc.lineStyle(1, color, 1);
    this.geometryGrapihc.moveTo(point1x , point1y);
    this.geometryGrapihc.lineTo(point2x, point2y);

    this.geometryGrapihc.endFill();
  }

  getGeometry() {
    return this.geometryGrapihc;
  }

  getCaption() {
    return this.captions;
  }

}

export default Geometry2D
