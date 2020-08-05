// Copyright 2018 Sidewalk Labs | http://www.eclipse.org/legal/epl-v20.html

import * as three from 'three';



export default function addSky(
  scene: three.Scene,
) {

  scene.background = new three.CubeTextureLoader().setPath('/sky/').load(
    [
      'TropicalSunnyDayLeft2048.png',
      'TropicalSunnyDayRight2048.png',
      'TropicalSunnyDayUp2048.png',
      'TropicalSunnyDayDown2048.png',
      'TropicalSunnyDayFront2048.png',
      'TropicalSunnyDayBack2048.png',
    ]
  );



}
