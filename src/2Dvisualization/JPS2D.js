import * as PIXI from 'pixi.js';

class JPS2D {
  constructor (parentElement, init) {
    this.parentElement = parentElement;
    this.init = init;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.trajectory = this.init.trajectoryData;
    this.geometry = this.init.geometryData;

    let app = new PIXI.Application({width: this.width, height: this.height});
    this.parentElement.appendChild(app.view);

  }
}

export default JPS2D;
