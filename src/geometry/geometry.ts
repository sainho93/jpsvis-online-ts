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

export interface Geometry {
	version: string;
	caption: string;
	'xmlns:xsi': string;
	unit: string; j
	rooms: Rooms | Room[];
}


interface GeoFile {
	geometry: Geometry; // geometry property means 'geometry' Tag
}

export interface Rooms {
	room: Room
}

export interface Room {
	id: string;
	caption: string;
	subroom: Subroom | Subroom[];
}

export interface Subroom {
	id: string;
	closed: string;
	class: string;
	polygon: Polygon | Polygon[];

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
		right: 100,
		bottom: 100},
		LAND);
	groundMesh.name = 'Land';
	groundMesh.receiveShadow = true;

	console.log('Loaded ground plane');
	group.add(groundMesh);

	// Geometry mesh
	makeGeometry(geoFile.geometry, group);
	console.log('Loaded building');


	return group;
}

function makeGeometry (geometry: Geometry, group: three.Group) {
	makeRooms(geometry.rooms, group)
}

function makeRooms (rooms: Rooms | Room[], group: three.Group) {
	if(Array.isArray(rooms))
	{
		for(let i = 0; i < (rooms as Room[]).length; i++) {
			makeRoom((rooms as Room[])[i], group)
		}
	}else{
		makeRoom((rooms as Rooms).room, group)
	}

}

function makeRoom (room: Room, group: three.Group) {
	if(Array.isArray(room.subroom))
	{
		for(let i = 0; i < ((room.subroom as Subroom[]).length); i++) {
			makeSubroom(room.subroom[i], group)
		}
	}else{
		makeSubroom((room.subroom as Subroom), group)
	}
}

function makeSubroom (subroom: Subroom, group: three.Group) {
	if(Array.isArray(subroom.polygon)){
		for (let i = 0; i < (subroom.polygon as Polygon[]).length; i++) {
			makePolygon(subroom.polygon[i], group)
		}
	}else{
		makePolygon((subroom.polygon as Polygon), group)
	}
}

function makePolygon (polygon: Polygon, group: three.Group) {
	if(polygon.vertex.length != 2){
		console.error( 'The format of polygon is wrong', polygon );
		return;
	}else {
		const point1: three.Vector2 = new three.Vector2(parseFloat(polygon.vertex[0].px),
			parseFloat(polygon.vertex[0].py));
		const point2: three.Vector2 = new three.Vector2(parseFloat(polygon.vertex[1].px),
			parseFloat(polygon.vertex[1].py));

		// Length of wall
		// length = sqrt(|x1-x2|*|x1-x2| + |y1-y2|*|y1-y2|)
		const length: number = Math.sqrt(Math.pow(Math.abs(point1.x - point2.x),2)
			+ Math.pow(Math.abs(point1.y - point2.y),2));

		// Rotation angle
		// angle = arctan(|y1-y2|/|x1-x2|) * PI/180
		const angle = Math.atan2(Math.abs(point1.y - point2.y), Math.abs(point1.x - point2.x));

		const wall: three.BoxBufferGeometry = new three.BoxBufferGeometry(length,1,0.2);
		wall.rotateY(angle);
		wall.translate((point1.x + point2.x)/2, 0.5, (point1.y + point2.y)/2);

		const mesh = new three.Mesh(wall, BUILDING);

		group.add(mesh);

	}
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



