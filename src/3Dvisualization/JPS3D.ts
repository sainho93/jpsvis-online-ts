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
import { InitResources } from '../initialization';
import Postprocessing from './effects/postprocessing';
import Geometry from './geometry';
import { TraFile } from './trajectory';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as dat from 'dat.gui/build/dat.gui.js';
import init from '../initialization';
import JPS2D from '../2Dvisualization/JPS2D';

const AMBIENT_LIGHT_COLOR = 0x404040;

interface state {
	pedestrians: boolean,
	wireframe: boolean,
	skeleton: boolean,
	addLights: boolean,
	radius: boolean,
	showTrajectory: boolean
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
	private DRACOloader: DRACOLoader;
	private pedModel: three.Object3D;
	private mixers: three.AnimationMixer[];
	private clock: three.Clock;
	private pedestrians: three.Object3D[];// this.pedestrians contains all imported models of pedestrian, not the trajectory data
	private pedRadius: three.Line[];
	private trajectory: TraFile;
	private init: InitResources;
	private frame: number;
	private state: state;
	private skeletonHelpers: three.SkeletonHelper[];
	private walkingClip: three.AnimationClip;
	private jps2d: JPS2D;

	constructor (parentElement: HTMLElement, init: InitResources) {
		const startMs = window.performance.now();

		this.parentElement = parentElement;
		this.width = window.innerWidth * 0.75
		this.height = window.innerHeight

		this.init = init;
		this.trajectory = init.trajectoryData;

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

		// Add dat gui
		this.skeletonHelpers = [];
		this.state = {
			pedestrians: true,
			wireframe: false,
			skeleton: false,
			addLights: true,
			radius: false,
			showTrajectory: false
		};

		this.gui = new dat.gui.GUI();
		const dispFolder = this.gui.addFolder( 'Display' );
		const playFolder = this.gui.addFolder('Play Controller')

		const pedCtrl = dispFolder.add(this.state,'pedestrians')
		pedCtrl.onChange(() => this.updatePedDisplay());
		const wireframeCtrl = dispFolder.add(this.state, 'wireframe');
		wireframeCtrl.onChange(() => this.updatePedDisplay());
		const skeletonCtrl = dispFolder.add(this.state, 'skeleton');
		skeletonCtrl.onChange(() => this.updatePedDisplay());

		playFolder.add({play: () => this.playAnimation()}, 'play');
		playFolder.add({pause: () => this.pauseAnimation()}, 'pause');
		playFolder.add({reset: () => this.resetPedLocation()}, 'reset');
		this.gui.add(this, 'switchTo2D').name('Switch To 2D');

		// Add geometry
		this.geometry = new Geometry(this.init.geometryData);
		this.scene.add(this.geometry.createRooms());
		this.scene.add(this.geometry.createTransitions());

		// Add pedestrians
		this.loader = new GLTFLoader();
		this.DRACOloader = new DRACOLoader();
		this.DRACOloader.setDecoderPath('three/examples/js/libs/draco/');
		// this.DRACOloader.preload();
		this.DRACOloader.setDecoderConfig({ type: 'js' });
		this.loader.setDRACOLoader(this.DRACOloader);

		this.mixers = [];
		this.pedestrians = [];
		this.pedRadius = []
		this.frame = 0;

		for(let i = 0; i<this.trajectory.pedestrians.length; i++) {
			this.loader.load(
				'/pedestrian/man_001.gltf',
				(gltf) => {
					gltf.scene.name = (i + 1).toString();
					gltf.scene.visible = false;
					this.scene.add(gltf.scene);
					this.pedestrians.push(gltf.scene);


					// set starting location
					const id = this.pedestrians.length - 1;

					const startLocation = this.trajectory.pedestrians[id][0];
					this.pedestrians[id].position.x = 0;
					this.pedestrians[id].position.y = 0;
					this.pedestrians[id].position.z = 0;
					this.pedestrians[id].rotation.y = 0;

					this.pedestrians[id].translateX(startLocation.coordinate.x);
					this.pedestrians[id].translateZ(-startLocation.coordinate.y);
					this.pedestrians[id].translateY(startLocation.coordinate.z);
					this.pedestrians[id].rotateY(0.5 * Math.PI);

					this.pedestrians[id].visible = this.state.pedestrians;

					this.setMixer(gltf.scene, gltf.animations[0]);
				},
				// called while loading is progressing
				function (xhr) {

					console.log((xhr.loaded / xhr.total * 100) + '% loaded');

				},
				function (error) {

					console.error(error);
				});
		}


		// Add sky
		addSky(this.scene);

		//  Post-processing passes apply filters and effects
		//  to the image buffer before it is eventually rendered to the screen.
		this.postprocessing = new Postprocessing(
			this.camera,
			this.scene,
			this.renderer,
			this.width,
			this.height,
		);

		// stats.js
		this.stats = new Stats();
		this.stats.showPanel(0); // 0 = show stats on FPS
		this.stats.dom.style.position = 'absolute'; // top left of container, not the page.
		this.stats.dom.style.left = '25%'
		this.parentElement.appendChild(this.stats.dom);


		// animate() is a callback func for requestAnimationFrame()
		// its 'this' should be set to the JPS3D instance
		this.animate = this.animate.bind(this);
		this.animate();

		window.addEventListener('resize', this.onResize.bind(this));

		const endMs = window.performance.now();

		console.log('Initialized three.js scene in', endMs - startMs, 'ms');

	}

	switchTo2D () {
		const myReq = requestAnimationFrame(this.animate);
		cancelAnimationFrame(myReq);

		// Clear content in scene from memory
		this.scene.traverse(function (item) {
			if (item instanceof three.Mesh) {
				item.geometry.dispose();
				item.material.dispose();
			}
		});


		// Clear 3D view
		const canvas = document.getElementsByTagName('canvas');

		for(let i = canvas.length - 1; i>=0; i--){
			canvas[i].parentNode.removeChild(canvas[i]);
		}

		// Clear dat.gui
		const guiMenus = document.getElementsByClassName('dg main a');

		for(let i = guiMenus.length - 1; i>=0; i--){
			guiMenus[i].parentNode.removeChild(guiMenus[i]);
		}

		// init 2D view
		(async () => {
				const initResources = await init();
				this.jps2d = new JPS2D(initResources.geometryRootEl, initResources)
			}
		)();

	}

	setMixer(object: three.Object3D, clip: three.AnimationClip){

		object.traverse((node) => {
			if (node.isLight) {
				this.state.addLights = false;
			} else if (node.isMesh) {
				node.material.depthWrite = !node.material.transparent;
			}
		});

		this.walkingClip = clip;

		const mixer = new three.AnimationMixer( object );
		this.mixers.push(mixer);

	}

	updatePedDisplay () {
		if (this.skeletonHelpers.length) {
			this.skeletonHelpers.forEach((helper) => this.scene.remove(helper));
		}

		for(let i=0; i<this.pedestrians.length; i++){
			// Wireframe
			this.traverseMaterials(this.pedestrians[i], (material) => {
				material.wireframe = this.state.wireframe;
			});

			// SkeletonHelper
			this.pedestrians[i].traverse((node) => {
				if (node.isMesh && node.skeleton && this.state.skeleton) {
					const helper = new three.SkeletonHelper(node.skeleton.bones[0].parent);
					helper.material.linewidth = 3;
					this.scene.add(helper);
					this.skeletonHelpers.push(helper);
				}
			});

			// Pedestrian visibility
			this.pedestrians[i].visible = this.state.pedestrians;
		}

	}

	traverseMaterials (object: three.Object3D, callback) {
		object.traverse((node) => {
			if (!node.isMesh) return;
			const materials = Array.isArray(node.material)
				? node.material
				: [node.material];
			materials.forEach(callback);
		});
	}

	updatePedLocation(){
		if(this.state.showTrajectory){
			for(let i=0; i<this.pedestrians.length; i++){
				const id = parseInt(this.pedestrians[i].name);
				const frame = Math.floor(this.frame/8);
				if(frame < this.trajectory.pedestrians[id-1].length){
					const location = this.trajectory.pedestrians[id-1][frame];

					this.pedestrians[i].rotation.y = (location.angle + 90) * Math.PI / 180 ; // Rotation of pedestrain, convert degree to rad
					this.pedestrians[i].position.x = location.coordinate.x;
					this.pedestrians[i].position.y = location.coordinate.z; // Y axes in trejactory = Z axes in three.JS
					this.pedestrians[i].position.z = -location.coordinate.y; // Z axes in trejactory = Y axes in three.JS // Revolve y axes
				}else {
					this.pedestrians[i].visible = false;
				}
			}

			this.frame += 1;
		}
	}

	playAnimation(){
		// Play walking animation
		for(let i=0; i<this.mixers.length; i++){
			const action = this.mixers[i].clipAction(this.walkingClip);
			action.play();
		}

		// Allow presenting trajectory
		this.state.showTrajectory = true;

	}

	pauseAnimation(){
		for(let i=0; i<this.mixers.length; i++){
			const action = this.mixers[i].clipAction(this.walkingClip);
			action.stop();
		}

		// Pause presenting trajectory
		this.state.showTrajectory = false;
	}


	resetPedLocation(){
		// Stop animation at first
		for(let i=0; i<this.mixers.length; i++){
			const action = this.mixers[i].clipAction(this.walkingClip);
			action.stop();
		}
		for(let i=0; i<this.pedestrians.length; i++){
			const startLocation = this.trajectory.pedestrians[i][0];
			this.pedestrians[i].position.x = 0;
			this.pedestrians[i].position.y = 0;
			this.pedestrians[i].position.z = 0;
			this.pedestrians[i].rotation.y = 0;


			this.pedestrians[i].translateX(startLocation.coordinate.x);
			this.pedestrians[i].translateZ(-startLocation.coordinate.y); // Y axes in trejactory = Z axes in three.JS // Revolve y axes
			this.pedestrians[i].translateY(startLocation.coordinate.z); // Z axes in trejactory = Y axes in three.JS
			this.pedestrians[i].rotateY(0.5 * Math.PI); // Rotation of pedestrain

			this.pedestrians[i].visible = this.state.pedestrians;
		}

		this.frame = 0;
		this.state.showTrajectory = false;
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

	animate () {
		requestAnimationFrame(this.animate);

		this.postprocessing.render();
		this.stats.update();
		this.controls.update();

		const dt = this.clock.getDelta();
		this.mixers.forEach(mixer => mixer.update(dt));

		this.updatePedLocation();
	}


}


