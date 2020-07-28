/*
 * \file JPS3D.ts
 * \date 2020 - 7 - 9
 * \author Tao Zhong
 * \copyright <2009 - 2020> Forschungszentrum Jülich GmbH. All rights reserved.
 *
 * \section License
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
 *
 * \section Description
 */

import * as _ from 'lodash';
import * as three from 'three';
import addSky from './effects/sky';
import * as Stats from 'stats.js'
import {InitResources} from './initialization';
import Postprocessing from './effects/postprocessing';
import Geometry from './geometry';
import TraFile from './trajectory';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
	private stats: Stats;
	private postprocessing: Postprocessing;
	private controls: OrbitControls;
	private geometry: Geometry;
	private width: number;
	private height: number
	private loader: GLTFLoader;
	private mixers: three.AnimationMixer[];
	private clock: three.Clock;
	private content: three.Object3D;
	private clip: three.AnimationClip;
	private pedestrans: three.Object3D[];
	private init: InitResources;
	private frame: number;

	constructor (parentElement: HTMLElement, init: InitResources) {
		const startMs = window.performance.now();

		this.parentElement = parentElement;
		this.width = window.innerWidth
		this.height = window.innerHeight

		this.init = init;

		// three.js
		this.renderer = new three.WebGLRenderer();
		(this.renderer as any).setPixelRatio(window.devicePixelRatio);

		// disable the ability to right click in order to allow rotating with the right button
		this.renderer.domElement.oncontextmenu = (e: PointerEvent) => false;
		this.renderer.domElement.tabIndex = 1;
		this.renderer.setSize(this.width, this.height);

		this.scene = new three.Scene();
		this.camera = new three.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);

		parentElement.appendChild(this.renderer.domElement);

		// clock
		this.clock = new three.Clock();
		// this.clock.getDelta = this.clock.getDelta.bind(this.clock);

		// axis
		const axesHelper = new three.AxesHelper(1000);
		this.scene.add(axesHelper);

		// controls
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		this.controls.maxPolarAngle = Math.PI * 0.5;
		this.controls.minDistance = 5;
		this.controls.maxDistance = 5000;

		// light
		// AmbientLight: light globally illuminates all objects in the scene equally.
		const ambient = new three.AmbientLight(AMBIENT_LIGHT_COLOR);
		this.scene.add(ambient);

		// HemisphereLight: positioned directly above the scene, with color fading from the sky color to the ground color.
		const hemisphereLight = new three.HemisphereLight(0xffffbb, 0x080820, 0.5);
		this.scene.add(hemisphereLight);

		// DirectionalLight: white directional light at half intensity shining from the top o simulate daylight.
		const directionalLight = new three.DirectionalLight(0xffffff, 0.5);
		directionalLight.castShadow = true;            // default false

		directionalLight.shadow.mapSize.width = 512;  // default
		directionalLight.shadow.mapSize.height = 512; // default
		directionalLight.shadow.camera.near = 0.5;    // default
		directionalLight.shadow.camera.far = 500;     // default

		this.scene.add(directionalLight);

		// Add geometry
		this.geometry = new Geometry(this.init.geometryData);
		this.scene.add(this.geometry.createRooms());
		this.scene.add(this.geometry.createTransitions());

		// Add pedestrians
		this.loader = new GLTFLoader();
		this.mixers = [];
		this.pedestrans = [];
		this.frame = 0;

		for(let i = 0; i<this.init.trajectoryData.pedestrians.length; i++){
			this.loader.load(
				'/pedestrian/man_001.gltf',
				(gltf) => {
					gltf.scene.name = (i+1).toString();
					this.pedestrans.push(gltf.scene);
					this.setContent(gltf.scene, gltf.animations[0]);
				},
				// called while loading is progressing
				function ( xhr ) {

					console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

				},
				function ( error ) {

					console.error( error );
				});
		}

		// Add dat gui
		this.gui = new dat.gui.GUI();
		//TODO: Add option to control whether present geometry (rooms, transitions)

		// Add sky
		addSky(this.scene);

		//  Post-processing passes apply filters and effects
		//  to the image buffer before it is eventually rendered to the screen.
		this.postprocessing = new Postprocessing(
			this.camera,
			this.scene,
			this.renderer,
			this.gui,
			this.width,
			this.height,
		);

		// stats.js
		this.stats = new Stats();
		this.stats.showPanel(0); // 0 = show stats on FPS
		parentElement.appendChild(this.stats.dom);
		this.stats.dom.style.position = 'absolute'; // top left of container, not the page.

		console.log(this.pedestrans);

		// animate() is a callback func for requestAnimationFrame()
		// its 'this' should be set to the JPS3D instance
		this.animate = this.animate.bind(this);
		this.animate();

		window.addEventListener('resize', this.onResize.bind(this));

		const endMs = window.performance.now();

		console.log('Initialized three.js scene in', endMs - startMs, 'ms');

	}

	setContent(object: three.Object3D, clip: three.AnimationClip){
		this.scene.add(object);

		this.content = object;

		this.content.traverse((node) => {
			if (node.isLight) {
				this.state.addLights = false;
			} else if (node.isMesh) {
				node.material.depthWrite = !node.material.transparent;
			}
		});

		this.clip = clip;

		this.updateGUI();

	}

	updateGUI (){
		const mixer = new three.AnimationMixer( this.content );
		this.mixers.push(mixer);
		const action = mixer.clipAction(this.clip);
		action.play();
	}

	updatePedestrians(pedestriansLocation: TraFile.pedestrians, frame: number){

		// for(let i = 0; i<this.pedestrans.length; i++){
		// 	const pedestrian = this.pedestrans[i]
		// 	const name = parseFloat(pedestrian.name);
		//
		// 	if (frame < pedestriansLocation[name].length){
		// 		const location = pedestriansLocation[name][frame];
		//
		// 		this.pedestrans[i].translateX(location.coordinate.x);
		// 		this.pedestrans[i].translateZ(location.coordinate.y);
		// 		this.pedestrans[i].translateY(location.coordinate.z);
		// 	}
		//
		//
		// }
	}

	animate () {
		requestAnimationFrame(this.animate);

		this.postprocessing.render();
		this.stats.update();
		this.controls.update();

		const dt = this.clock.getDelta();
		this.mixers.forEach(mixer => mixer.update(dt));


		// this.updatePedestrians(this.init.trajectoryData.pedestrians, this.frame);
		// this.frame = this.frame + 1;


	}

	onResize() {
		const width = this.parentElement.clientWidth;
		const height = this.parentElement.clientHeight;

		// resize WebGL canvas in response to window resizes
		this.renderer.setSize(width, height);

		this.postprocessing.onResize(width, height);

		// also readjust camera so images aren't stretched or squished
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
	}
}


