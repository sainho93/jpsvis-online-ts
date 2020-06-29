/*
 * \file initialization.ts
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

import * as _ from 'lodash'
import * as three from 'three'
import {loadOBJFile} from './utils';

const textureLoader = new three.TextureLoader();

export interface Geometry {
	version: string;
	caption: string;
	'xmlns:xsi': string;
	unit: string
}

export interface Geo {
	geo: Geometry;
}

export interface InitResources {
	geometry: Geo;
	geometryRootEl: HTMLElement;
}

function getOrThrow(id: string): HTMLElement {
	const el = document.getElementById(id);
	if (!el) {
		throw new Error(`Unable to get element #${id}.`);
	}
	return el;
}

async function fetchJson<T>(url: string): Promise<T> {
	const response = await fetch(url);
	if (response.status !== 200) {
		console.log('non-200', url);
		throw new Error(`Unable to load ${url}, response: ${response}`);
	}
	const val = (await response.json()) as T;

	console.log(`Loaded ${url}`);

	return val;
}



export default async function init (): Promise<InitResources> {
	const loadStartMs = window.performance.now();
	const geometry = await fetchJson<Geo>('geometry');
	const loadEndMs = window.performance.now();

	console.log('Loaded static resources in', loadEndMs - loadStartMs, 'ms');

	return{
		geometry,
		geometryRootEl: getOrThrow('canvas')
	}
}
