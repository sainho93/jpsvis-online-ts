import * as PIXI from 'pixi.js';

class Geometry2d {
  constructor (app, geometryData) {
    this.geometryData = geometryData;
    this.app = app;

    this.rooms = this.geometryData.geometry.rooms;
    this.transitions = this.geometryData.geometry.transitions;
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
    const point1x = parseFloat(element.vertex[0].px);
    const point1y = parseFloat(element.vertex[0].py);
    const point2x = parseFloat(element.vertex[1].px);
    const point2y = parseFloat(element.vertex[1].py);

    let line = new PIXI.Graphics();
    line.lineStyle(1, color, 1);
    line.moveTo(point1x, point1y);
    line.lineTo(point2x, point2y);

    this.app.stage.addChild(line);
  }


}

export default Geometry2d
