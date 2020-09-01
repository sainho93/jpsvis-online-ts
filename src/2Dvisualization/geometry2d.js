import * as PIXI from 'pixi.js';



class Geometry2d {
  constructor (geometryData, movelocation) {
    this.geometryData = geometryData;
    this.geometryGrapihc = new PIXI.Graphics();

    this.rooms = this.geometryData.geometry.rooms;
    this.transitions = this.geometryData.geometry.transitions;

    this.movelocation = movelocation;

  }

  addRooms(){
    for (let i = 0; i < this.rooms.room.length; i++){
      this.createRoom(this.rooms.room[i]);
    }
  }

  addTransitions(){
    for (let i = 0; i < this.transitions.transition.length; i++){
      this.createTransition(this.transitions.transition[i])
    }
  }

  createRoom(room){
    const polygons = room.subroom.polygon;

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
    const point1x = parseFloat(element.vertex[0].px) + this.movelocation.offsetX;
    const point1y = parseFloat(element.vertex[0].py) + this.movelocation.offsetY;
    const point2x = parseFloat(element.vertex[1].px) + this.movelocation.offsetX;
    const point2y = parseFloat(element.vertex[1].py) + this.movelocation.offsetY;

    this.geometryGrapihc.beginFill();
    this.geometryGrapihc.lineStyle(1, color, 1);
    this.geometryGrapihc.moveTo(point1x * this.movelocation.scale, point1y * this.movelocation.scale);
    this.geometryGrapihc.lineTo(point2x * this.movelocation.scale, point2y * this.movelocation.scale);

    this.geometryGrapihc.endFill();
  }

  getGeometry() {
    return this.geometryGrapihc;
  }

}

export default Geometry2d
