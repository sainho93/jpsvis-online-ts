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
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';


/**
 * Structures
 **/


interface GeoFile {
	geometry: Geometry; // geometry property means 'geometry' Tag
}

interface Rooms {
	room: Room
}

interface Room {
	id: string;
	caption: string;
	subroom: Subroom | Subroom[];
}

interface Subroom {
	id: string;
	caption: string;
	closed: string;
	class: string;
	polygon: Polygon | Polygon[];

}

interface Polygon {
	caption: string;
	vertex: Vertex[];
}

interface Vertex {
	px: string;
	py: string
}

/**
 * A class to contain information and methods for geometry
 **/

export default class Geometry {
	private geoFile: GeoFile;
	private version: string;
	private unit: string;
	private rooms: Rooms | Room[];

	constructor (file: GeoFile) {
		this.geoFile = file;

		if(this.validateFile(this.geoFile) === false){
			console.error('Program exited!');
			return;
		}

		this.version = file.geometry.version;
		this.unit = file.geometry.unit;
		this.rooms = file.geometry.rooms;
	}

	protected validateFile(file: GeoFile): boolean{
		if(file.geometry.version === '0.8' && file.geometry.unit === 'm'){
			console.log('XML file format validated!');
			return true;
		}else {
			console.error('XML file format is invaild!');
			return false;
		}
	}

	createGround(): three.Mesh{
		const groundMesh: three.Mesh = this.makeGroundMesh({
				left: 0,
				top: 0,
				right: 100,
				bottom: 100},
			LAND);
		groundMesh.name = 'Land';
		groundMesh.receiveShadow = true;

		console.log('Loaded ground plane');

		return groundMesh;
	}

	createRooms(): three.Group{
		const roomGroup = new three.Group();

		if(Array.isArray(this.rooms))
		{
			for(let i = 0; i < (this.rooms as Room[]).length; i++) {
				roomGroup.add(this.makeRoom((this.rooms as Room[])[i]));
			}
		}else{
			roomGroup.add(this.makeRoom((this.rooms as Rooms).room));
		}

		return roomGroup;
	}

	protected makeRoom (room: Room): three.Group{
		const subroomGroup = new three.Group();

		if(Array.isArray(room.subroom))
		{
			for(let i = 0; i < ((room.subroom as Subroom[]).length); i++) {
				subroomGroup.add(this.makeSubroom(room.subroom[i]));
			}
		}else{
			subroomGroup.add(this.makeSubroom(room.subroom as Subroom));
		}

		return subroomGroup;
	}

	protected makeSubroom (subroom: Subroom): three.Mesh {
		let subroomGeometry: three.BufferGeometry;

		if(Array.isArray(subroom.polygon)){
			const polygons: three.BufferGeometry[] = [];

			for (let i = 0; i < (subroom.polygon as Polygon[]).length; i++) {
				polygons.push(this.makePolygon(subroom.polygon[i]));
			}

			const unmergeSubroomGeometry = BufferGeometryUtils.mergeBufferGeometries(polygons);
			subroomGeometry = BufferGeometryUtils.mergeVertices(unmergeSubroomGeometry, 1);

		}else{
			subroomGeometry = this.makePolygon((subroom.polygon as Polygon));
		}

		const subroomMesh = new three.Mesh(subroomGeometry, BUILDING);
		subroomMesh.name = subroom.caption;

		return subroomMesh;
	}

	protected makePolygon (polygon: Polygon): three.BoxBufferGeometry {
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

			return wall;
		}
	}


	protected makeGroundMesh(
		{top, left, right, bottom}: {top: number; left: number; right: number; bottom: number},
		material: three.Material,
	) {
		return flatMeshFromVertices(
			[[left, top], [right, top], [right, bottom], [left, bottom]],
			material,
		);
	}
}

















