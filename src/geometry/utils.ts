/*
 * \file utils.ts
 * \date 2020 - 6 - 24
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

import * as three from 'three';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'

const OBJ_LOADER = new OBJLoader;

/** Set a material on all meshes in an object. */
export function setMaterial(obj: three.Object3D, material: three.Material) {
	obj.traverse(child => {
		if (child instanceof three.Mesh) {
			child.material = material;
		}
	});
}

/** Load an OBJ file, returning a Promise for it. Optionally adds a material. */
export function loadOBJFile(url: string, material?: three.Material): Promise<three.Object3D> {
	return new Promise<three.Object3D>((resolve, reject) => {
		OBJ_LOADER.load(
			url,
			obj => {
				if (material) {
					setMaterial(obj, material);
				}
				resolve(obj);
			},
			() => {},
			reject,
		);
	});
}
