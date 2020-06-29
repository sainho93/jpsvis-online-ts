// Copyright 2018 Sidewalk Labs | http://www.eclipse.org/legal/epl-v20.html

import * as three from 'three';

const AMBIENT_LIGHT_COLOR = 0x444444;

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


  // Set ambient light
  const ambient = new three.AmbientLight(AMBIENT_LIGHT_COLOR);
  scene.add(ambient);
}
