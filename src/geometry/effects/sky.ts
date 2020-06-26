// Copyright 2018 Sidewalk Labs | http://www.eclipse.org/legal/epl-v20.html
import * as dat from 'dat.gui/build/dat.gui.js'
import * as three from 'three';

const CUBE_DIR = './sky/';
const CUBE_FILES = [
  'TropicalSunnyDayLeft2048.png',
  'TropicalSunnyDayRight2048.png',
  'TropicalSunnyDayUp2048.png',
  'TropicalSunnyDayDown2048.png',
  'TropicalSunnyDayFront2048.png',
  'TropicalSunnyDayBack2048.png',
];

export default function addSky(
  gui: typeof dat.gui.GUI,
  scene: three.Scene,
  // centerX: number,
  // centerZ: number,
) {
  // Skybox from https://93i.de/p/free-skybox-texture-set/
  // SkyboxSet by Heiko Irrgang is licensed under a Creative Commons Attribution-ShareAlike 3.0
  scene.background = new three.CubeTextureLoader().setPath(CUBE_DIR).load(CUBE_FILES);

}
