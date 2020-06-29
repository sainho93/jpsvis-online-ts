// Copyright 2018 Sidewalk Labs | http://www.eclipse.org/legal/epl-v20.html

import * as three from 'three';

const AMBIENT_LIGHT_COLOR = 0x404040;

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

  // White directional light at half intensity shining from the top o simulate daylight.
  // This light can cast shadows
  const directionalLight = new three.DirectionalLight( 0xffffff, 0.5 );
  directionalLight.castShadow = true;            // default false

  //Set up shadow properties for the light
  directionalLight.shadow.mapSize.width = 512;  // default
  directionalLight.shadow.mapSize.height = 512; // default
  directionalLight.shadow.camera.near = 0.5;    // default
  directionalLight.shadow.camera.far = 500;     // default

  scene.add( directionalLight );
}
