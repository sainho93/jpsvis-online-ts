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

    this.app = new PIXI.Application({width: this.width, height: this.height});
    this.parentElement.appendChild(this.app.view);

    this.app.renderer.view.style.position = "absolute";
    this.app.renderer.view.style.display = "block";
    this.app.renderer.autoResize = true;
    this.app.renderer.resize(this.width, this.height);

    this.app.renderer.backgroundColor = 0xF8F8FF;


    this.movelocation = {
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    }

    // Add dat gui
    this.gui = new dat.gui.GUI();

    const playFolder = this.gui.addFolder('Play Controller')
    playFolder.add(this, 'playAnimation').name('Play');
    playFolder.add(this, 'pauseAnimation').name('Pause');
    playFolder.add(this, 'resetPedLocation').name('Reset');
    this.gui.add(this, 'switchTo3D').name('Switch To 3D');

    // const locationFoler = this.gui.addFolder('Move Geometry').listen();
    // const offsetXController = locationFoler.add(this.movelocation, "offsetX").min(0).max(1000).step(10);
    // locationFoler.add(this.movelocation, "offsetY").min(0).max(1000).step(10);
    // locationFoler.add(this.movelocation, "scale").min(0).max(100).step(100);
    //
    // offsetXController.onChange()

    this.gui.add

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
