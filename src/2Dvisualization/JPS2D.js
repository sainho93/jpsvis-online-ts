import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport'
import * as dat from 'dat.gui/build/dat.gui.js';
import init from '../initialization';
import JPS3D from '../3Dvisualization/JPS3D';
import Geometry2D from './geometry2d';
import Pedestrian2D from './pedestrian2d';

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

    this.probs = {
      offsetX: 0,
      offsetY: 0,
      scale: 10,
      showPedestrian: true,
      showCaption: false,

      playTrajectory: false,
    }

    this.frame = 0;

    this.endFrame = this.getEndFrame();

    // Add dat gui
    this.gui = new dat.gui.GUI();

    const displayFolder = this.gui.addFolder('Display Options');
    const pedCtrl = displayFolder.add(this.probs, 'showPedestrian').name('Pedestrian');
    pedCtrl.onChange(() => this.updatePedDisplay());
    // displayFolder.add(this.probs, 'showCaption').name('Caption');
    // displayFolder.add(this.probs, 'showEllipse').name('Ellipse');
    // displayFolder.add(this.probs, 'showColor').name('Color');

    const playFolder = this.gui.addFolder('Play Options');
    playFolder.add(this, 'playAnimation').name('Play');
    playFolder.add(this, 'pauseAnimation').name('Pause');
    playFolder.add(this, 'resetPedLocation').name('Reset');
    playFolder.add(this, 'playLastFrame').name('Last Frame');
    playFolder.add(this, 'playNextFrame').name('Next Frame');

    const locationFoler = this.gui.addFolder('Scale Geometry');

    const that = this;
    // locationFoler.add(this.probs, "offsetX")
    //   .min(-1000).max(1000).step(10)
    //   .onChange(function (newValue){
    //     that.moveX(newValue);
    //     });
    // locationFoler.add(this.probs, "offsetY")
    //   .min(-1000).max(1000).step(10)
    //   .onChange(function (newValue){
    //     that.moveY(newValue);
    //   });
    locationFoler.add(this.probs, "scale")
      .min(1).max(50).step(1)
      .onChange(function (newValue){
        that.scaleGeometry(newValue);
      });

    this.gui.add(this, 'switchTo3D').name('Switch To 3D');

    this.viewport = new Viewport({
      screenWidth: this.width,
      screenHeight: this.height,
      worldWidth: this.width,
      worldHeight: this.height,

      interaction: this.app.renderer.plugins.interaction
    })

    this.viewport
      .drag()
      .pinch()
      .wheel()

    this.app.stage.addChild(this.viewport);

    this.geometryContainer = new PIXI.Container();
    const geometry = new Geometry2D(this.geometryData, this.probs);

    geometry.addRooms();
    geometry.addTransitions();

    this.geometryContainer.addChild(geometry.getGeometry());

    this.pedestrianContainer = new PIXI.Container();
    this.informationContainer = new PIXI.Container();
    this.app.stage.addChild(this.informationContainer);


    this.viewport.addChild(this.geometryContainer);
    this.viewport.addChild(this.pedestrianContainer);

    this.setFixedFrame(0); // Default show pedestrians

    this.animate = this.animate.bind(this);
    this.animate();

    this.app.renderer.render(this.app.stage);
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

  updatePedDisplay(){
    if(this.probs.showPedestrian === false){
      this.pedestrianContainer.removeChildren();
    }else {
      this.resetPedLocation();
    }
  }

  playLastFrame(){
    this.probs.playTrajectory = false;
    if(this.frame > 0){
      this.frame -= 8;
    }

    this.setFixedFrame(this.frame)
  }

  playNextFrame(){
    this.probs.playTrajectory = false;
    this.frame += 8;
    this.setFixedFrame(this.frame)
  }

  setFixedFrame(frame){
    if(this.probs.showPedestrian){
      this.pedestrianContainer.removeChildren();

      const pedestrians = new Pedestrian2D(this.trajectoryData, this.probs
        ,frame);

      pedestrians.addPedestrians();

      this.pedestrianContainer.addChild(pedestrians.getPedestrian());
    }
  }

  updatePedLocation () {
    if(this.probs.playTrajectory && this.probs.showPedestrian){

      this.pedestrianContainer.removeChildren();

      const pedestrians = new Pedestrian2D(this.trajectoryData, this.probs
        ,this.frame);

      pedestrians.addPedestrians();

      this.pedestrianContainer.addChild(pedestrians.getPedestrian());

      this.frame += 1;
    }
  }

  updateInformation () {
    this.informationContainer.removeChildren();

    let EvacuatedNumber = 0;
    let unEvacuatedNumber = 0;

    let frameNumber;
    let pedestrianNumber;

    if(Math.floor(this.frame/8) <= this.endFrame){


      frameNumber = "Frame number: " + Math.floor(this.frame/8).toString();

      for(let i=0; i<this.trajectoryData.pedestrians.length; i++){
        const frame = Math.floor(this.frame/8);
        if(frame>this.trajectoryData.pedestrians[i].length){
          EvacuatedNumber += 1;
        }
      }

      unEvacuatedNumber = this.trajectoryData.pedestrians.length - EvacuatedNumber;


    }else {
      this.informationContainer.removeChildren();

      frameNumber = "Frame number: " + Math.floor(this.endFrame).toString();
      EvacuatedNumber = this.trajectoryData.pedestrians.length;

      this.probs.playTrajectory = false; // Stop playing when all pedestrians evacuated
    }

    let meassge_frame = new PIXI.Text(frameNumber);
    meassge_frame.position.set(60,60);
    this.informationContainer.addChild(meassge_frame);

    pedestrianNumber = "Evacuated pedestrians number: " + EvacuatedNumber.toString();
    let meassage_pedestrian = new PIXI.Text(pedestrianNumber);
    meassage_pedestrian.position.set(60, 90);
    this.informationContainer.addChild(meassage_pedestrian);

    const pedestrianInGeometryNumber = "In simulation pedestrians number: " + unEvacuatedNumber.toString();
    let meassage_pedestrian_in_geometry = new PIXI.Text(pedestrianInGeometryNumber);
    meassage_pedestrian_in_geometry.position.set(60,120);
    this.informationContainer.addChild(meassage_pedestrian_in_geometry);


  }

  playAnimation () {
    this.probs.playTrajectory = true;
  }

  pauseAnimation () {
    this.probs.playTrajectory = false;
  }

  resetPedLocation () {
    this.probs.playTrajectory = false;
    this.frame = 0;

    this.setFixedFrame(this.frame);
  }

  scaleGeometry (value) {
    this.probs.scale = value;

    this.resetPedLocation();
  }

  getEndFrame(){
    let endFrames = [];
    for(let i=0; i<this.trajectoryData.pedestrians.length; i++){
      endFrames.push(this.trajectoryData.pedestrians[i].length)
    }

    return Math.max(...endFrames);

  }

  animate(){
    requestAnimationFrame(this.animate);

    this.updatePedLocation();
    this.updateInformation();

  }
}

export default JPS2D;
