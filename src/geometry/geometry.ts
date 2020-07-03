/*
 * \file geometry.ts
 * \date 2020 - 6 - 29
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
 *
 * \section Description
 *
 */

import * as _ from 'lodash'
import * as three from 'three';

import {LAND, BUILDING} from './materials'
import {flatMeshFromVertices} from './utils'


/**
 * Structures
 * */
export interface GeoFile {
	geometry: Geometry; // geometry property means 'geometry' Tag
}

export interface Geometry {
	version: string;
	caption: string;
	'xmlns:xsi': string;
	unit: string
	rooms: Rooms;
}

export interface Rooms {
	room: Room[]
}

export interface Room {
	id: string;
	caption: string;
	subroom: Subroom[];

}

export interface Subroom {
	id: string;
	closed: string;
	class: string;
	polygon: Polygon[];

}

export interface Polygon {
	caption: string;
	vertex: Vertex[];
}

export interface Vertex {
		px: string;
		py: string
}


/**
 * Geometry constructors
 * */

/** Create a group of three.js objects representing the static elements of the scene. */

export function makeStaticObjects(
	geoFile: GeoFile,
): three.Group {
	const group = new three.Group();

	// Land mesh
	const groundMesh = makeGroundMesh({
		left: 0,
		top: 0,
		right: 1000,
		bottom: 1000},
		LAND);
	groundMesh.name = 'Land';
	groundMesh.receiveShadow = true;
	// group.add(groundMesh);

	console.log('Loaded ground plane');

	// Geometry mesh
	const building = new three.BoxBufferGeometry();
	const buildingMesh = new three.Mesh(makeGeometry(geoFile.geometry, building), BUILDING);

	group.add(buildingMesh);

	return group;
}

function makeGeometry (geometry: Geometry, building: three.BoxBufferGeometry) {
	building.merge(makeRooms(geometry.rooms, building))
	return building
}

function makeRooms (rooms: Rooms, building: three.BoxBufferGeometry) {
	for(let i = 0; i < rooms.room.length; i++) {
			building.merge(makeRoom(rooms.room[i], building))
	}

	return building
}

function makeRoom (room: Room, building: three.BoxBufferGeometry) {
	for (let i = 0; i < room.subroom.length; i++) {
		building.merge(makeSubroom(room.subroom[i], building))
	}
	return building
}

function makeSubroom (subroom: Subroom, building: three.BoxBufferGeometry) {
	for (let i = 0; i < subroom.polygon.length; i++) {
		building.merge(makePolygon(subroom.polygon[i], building))
	}

	return building
}

function makePolygon (polygon: Polygon, building: three.BoxBufferGeometry) {
	const points: three.Vector2[] = [];


	for (let i = 0; i < polygon.vertex.length; i++) {
		const point = new three.Vector2(parseFloat(polygon.vertex[i].px), parseFloat(polygon.vertex[i].py))
		points.push(point);
	}

	const xDiffence: number[] = [];
	const yDiffence: number[] = [];

	for(let i = 0; i < points.length; i++){
		xDiffence.push(Math.abs(points[0].x - points[i].x))
		yDiffence.push(Math.abs(points[0].y - points[i].y))
	}

	const wall = new three.BoxBufferGeometry(Math.max(...xDiffence),Math.max(...yDiffence),1)

	building.merge(wall)

	return building
}

function makeGroundMesh(
	{top, left, right, bottom}: {top: number; left: number; right: number; bottom: number},
	material: three.Material,
) {
	return flatMeshFromVertices(
		[[left, top], [right, top], [right, bottom], [left, bottom]],
		material,
	);
}



