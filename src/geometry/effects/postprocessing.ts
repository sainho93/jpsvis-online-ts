/*
 * \file postprocessing.ts
 * \date 2020 - 6 - 29
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
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as dat from 'dat.gui/build/dat.gui.js';

import * as three from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {SMAAPass} from 'three/examples/jsm/postprocessing/SMAAPass'

import {CopyShader} from 'three/examples/jsm/shaders/CopyShader'

export default class Effects {
	private camera: three.Camera;
	private scene: three.Scene;
	private renderer: three.Renderer;
	private gui: typeof dat.gui.GUI;

	private depthMaterial: three.MeshDepthMaterial;
	private depthRenderTarget: three.WebGLRenderTarget;
	private composer: typeof EffectComposer;

	private effectsEnabled: {
		smaa: boolean;
	};
	private ssaoPass: typeof ShaderPass;
	private ssaoParams: {
		cameraNear: number;
		cameraFar: number;
		radius: number;
		aoClamp: number;
		lumInfluence: number;
		onlyAO: boolean;
	};
	private smaaPass: typeof SMAAPass;

	constructor(
		camera: three.Camera,
		scene: three.Scene,
		renderer: three.Renderer,
		gui: typeof dat.gui.GUI,
		width: number,
		height: number,
	) {
		this.camera = camera;
		this.scene = scene;
		this.renderer = renderer;
		this.gui = gui;

		this.depthMaterial = new three.MeshDepthMaterial();
		this.depthMaterial.depthPacking = three.RGBADepthPacking;
		this.depthMaterial.blending = three.NoBlending;
		this.depthRenderTarget = new three.WebGLRenderTarget(width, height, {
			minFilter: three.LinearFilter,
			magFilter: three.LinearFilter,
			format: three.RGBAFormat,
		});

		this.initPostprocessing(width, height);
		this.onResize(width, height);
	}

	private initPostprocessing(width: number, height: number) {
		// Init Render pass
		const renderPass = new RenderPass(this.scene, this.camera);

		// Subpixel Morphological Antialiasing is an efficient technique to provide antialiasing.
		this.smaaPass = new SMAAPass(width, height);
		this.smaaPass.needsSwap = true;

		// CopyShader copies the image contents of the EffectComposer's read buffer to its write buffer
		const copyPass = new ShaderPass(CopyShader);

		// Set passes into composer
		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(renderPass);
		this.composer.addPass(this.smaaPass);
		copyPass.renderToScreen = true;
		this.composer.addPass(copyPass);

		this.effectsEnabled = {
			smaa: true,
		};
	}

	render() {
		this.composer.render();
	}

	onResize(width: number, height: number) {
		const pixelRatio = window.devicePixelRatio;
		const newWidth = Math.floor(width * pixelRatio) || width;
		const newHeight = Math.floor(height * pixelRatio) || height;
		this.composer.setSize(newWidth, newHeight);
	}
}
