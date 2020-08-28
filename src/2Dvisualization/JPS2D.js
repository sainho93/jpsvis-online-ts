import * as PIXI from 'pixi.js';
import * as dat from 'dat.gui/build/dat.gui.js';
import init from '../initialization';
import JPS3D from '../3Dvisualization/JPS3D'
import Geometry2D from './geometry2d'

class JPS2D {
  constructor (parentElement, init) {
    this.parentElement = parentElement;
    this.init = init;

    this.width = window.innerWidth * 0.75;
    this.height = window.innerHeight;

    this.trajectoryData = this.init.trajectoryData;
    this.geometryData = this.init.geometryData;

    let app = new PIXI.Application({width: this.width, height: this.height});
    this.parentElement.appendChild(app.view);

    app.renderer.backgroundColor = 0xF8F8FF;
    app.renderer.autoResize = true;

    // Add dat gui
    this.gui = new dat.gui.GUI();

    const playFolder = this.gui.addFolder('Play Controller')
    playFolder.add({play: () => this.playAnimation()}, 'play');
    playFolder.add({pause: () => this.pauseAnimation()}, 'pause');
    playFolder.add({reset: () => this.resetPedLocation()}, 'reset');
    this.gui.add({Switch_To_3D: () => this.switchTo3D()}, 'Switch_To_3D');

    // Add geometry
    this.geometry = new Geometry2D(app, init.geometryData);
    this.geometry.addRooms();
    this.geometry.addTransitions();

  }


  switchTo3D () {
    // Clear 2D view
    const canvas = document.getElementsByTagName('canvas');

    for(let i = canvas.length - 1; i>=0; i--){
      canvas[i].parentNode.removeChild(canvas[i]);
    }

    // Clear dat.gui
    const guiMenus = document.getElementsByClassName('dg main a');

    for(let i = guiMenus.length - 1; i>=0; i--){
      guiMenus[i].parentNode.removeChild(guiMenus[i]);
    }

    // init 3D view
    (async () => {
        const initResources = await init();
        const jps3d = new JPS3D(initResources.geometryRootEl, initResources)
      }
    )();
  }

  playAnimation () {

  }

  pauseAnimation () {

  }

  resetPedLocation () {

  }
}

export default JPS2D;
