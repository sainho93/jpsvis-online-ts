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



    const locationFoler = this.gui.addFolder('Move Geometry');

    const that = this;
    locationFoler.add(this.movelocation, "offsetX")
      .min(-500).max(500).step(10)
      .onChange(function (newValue){
        that.moveX(newValue);
        });
    locationFoler.add(this.movelocation, "offsetY")
      .min(-500).max(500).step(10)
      .onChange(function (newValue){
        that.moveY(newValue);
      });
    locationFoler.add(this.movelocation, "scale")
      .min(1).max(100).step(2)
      .onChange(function (newValue){
        that.scaleGeometry(newValue);
      });

    this.gui.add(this, 'switchTo3D').name('Switch To 3D');

    // Add geometry
    // this.geometry = new Geometry2D(init.geometryData, this.movelocation);
    // this.geometry.addRooms();
    // this.geometry.addTransitions();

    this.geometryContainer = new PIXI.Container();
    // this.geometryContainer.addChild(this.geometry.getGeometry())


    // Add Pedestrians
    this.pedestrianContainer = new PIXI.Container();

    this.app.stage.addChild(this.geometryContainer);
    this.app.stage.addChild(this.pedestrianContainer);

    this.animate = this.animate.bind(this);
    this.animate();
  }

  updateGeometry(){
    this.geometryContainer.removeChildren();

    const geometry = new Geometry2D(this.geometryData, this.movelocation);
    geometry.addRooms();
    geometry.addTransitions();

    this.geometryContainer.addChild(geometry.getGeometry());
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

  moveX (value) {
    this.movelocation.offsetX = value;
  }

  moveY (value) {
    this.movelocation.offsetY = value;
  }

  scaleGeometry (value) {
    this.movelocation.scale = value;
  }

  animate(){
    requestAnimationFrame(this.animate);

    this.updateGeometry();

    this.app.renderer.render(this.app.stage);
  }
}

export default JPS2D;
