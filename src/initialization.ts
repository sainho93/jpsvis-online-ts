/*
 * \file initialization.ts
 * \date 2020 - 6 - 24
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

import {GeoFile} from './3Dvisualization/geometry'
import {TraFile} from './3Dvisualization/trajectory'

export interface InitResources {
	geometryData: GeoFile;
	geometryRootEl: HTMLElement;
	trajectoryData: TraFile
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
	const geoData = await fetchJson<GeoFile>('geometry');
	const traData = await fetchJson<TraFile>('trajectory')
	const loadEndMs = window.performance.now();

	console.log('Loaded static resources in', loadEndMs - loadStartMs, 'ms');

	return{
		geometryData: geoData,
		geometryRootEl: getOrThrow('canvas'),
		trajectoryData: traData
	}
}
