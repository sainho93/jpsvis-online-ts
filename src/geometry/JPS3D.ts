/*
 * \file JPS3D.ts
 * \date 2020 - 6 - 25
 * \author Tao Zhong
 * \copyright <2009 - 2020> Forschungszentrum Jülich GmbH. All rights reserved.
 *
 * \section Lincense
 * This file is part of JuPedSim.
 *
 * JuPedSim is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 *  any later version.
 *
 * JuPedSim is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with JuPedSim. If not, see <http://www.gnu.org/licenses/>.
 */

import * as _ from 'lodash';
import * as three from 'three';
import addSky from './effects/sky';
import * as Stats  from 'stats.js'
import {InitResources} from './initialization';
import Postprocessing from './effects/postprocessing';
import {makeStaticObjects} from './geometry';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as dat from 'dat.gui/build/dat.gui.js';

const AMBIENT_LIGHT_COLOR = 0x404040;

export interface Params {
	onClick: (
		XY: [number, number] | null,
	) => any;
	onUnfollow: () => any;
	onRemove: (id: string) => any;
	onUnhighlight: () => any;
}

export default class JPS3D {
	parentElement: HTMLElement;

	private renderer: three.Renderer;
	private camera: three.PerspectiveCamera;
	private scene: three.Scene;
	private gui: typeof dat.gui.GUI;
	private groundPlane: three.Object3D;
	private stats: Stats;
	private postprocessing: Postprocessing;
	private controls: OrbitControls;

	constructor(parentElement: HTMLElement, init: InitResources){
		const startMs = window.performance.now();

		this.parentElement = parentElement;
		const width = parentElement.clientWidth;
		const height = parentElement.clientHeight;

		// three.js
		this.renderer = new three.WebGLRenderer();
		(this.renderer as any).setPixelRatio(window.devicePixelRatio);
		// disable the ability to right click in order to allow rotating with the right button
		this.renderer.domElement.oncontextmenu = (e: PointerEvent) => false;
		this.renderer.domElement.tabIndex = 1;
		this.renderer.setSize(width, height);

		this.scene = new three.Scene();

		this.camera = new three.PerspectiveCamera(75, width / height, 1, 20000);
		parentElement.appendChild(this.renderer.domElement);

		// controls
		this.controls = new OrbitControls( this.camera, this.renderer.domElement );

		this.controls.maxPolarAngle = Math.PI * 0.5;
		this.controls.minDistance = 10;
		this.controls.maxDistance = 5000;

		// light
		// Set ambient light
		const ambient = new three.AmbientLight(AMBIENT_LIGHT_COLOR);
		this.scene.add(ambient);

		// White directional light at half intensity shining from the top o simulate daylight.
		// This light can cast shadows
		const directionalLight = new three.DirectionalLight( 0xffffff, 0.5 );
		directionalLight.castShadow = true;            // default false

		//Set up shadow properties for the light
		directionalLight.shadow.mapSize.width = 512;  // default
		directionalLight.shadow.mapSize.height = 512; // default
		directionalLight.shadow.camera.near = 0.5;    // default
		directionalLight.shadow.camera.far = 500;     // default

		this.scene.add( directionalLight );

		// Add geometry
		const staticGroup: three.Group = makeStaticObjects(init.geometryData);
		this.scene.add(staticGroup);

		// Add gound plane
		this.groundPlane = this.scene.getObjectByName('Land');

		// Add dat gui
		this.gui = new dat.gui.GUI();

		// Add sky
		addSky(this.scene);

		//  Post-processing passes apply filters and effects
		//  to the image buffer before it is eventually rendered to the screen.
		this.postprocessing = new Postprocessing(
			this.camera,
			this.scene,
			this.renderer,
			this.gui,
			width,
			height,
		);

		// stats.js
		this.stats = new Stats();
		this.stats.showPanel(0); // 0 = show stats on FPS
		parentElement.appendChild(this.stats.dom);
		this.stats.dom.style.position = 'absolute'; // top left of container, not the page.

		this.animate = this.animate.bind(this);
		this.animate();


		const endMs = window.performance.now();

		console.log('Initialized three.js scene in', endMs - startMs, 'ms');
	}

	animate() {
		this.postprocessing.render();
		this.stats.update();

		requestAnimationFrame(this.animate);
	}
}
