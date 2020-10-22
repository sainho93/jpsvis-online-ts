/*
 * \file 3Dvisualization.ts
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
 *
 * \section Description
 */

import * as _ from 'lodash'
import * as three from 'three';

import {BUILDING, TRANSITION, STAIR, PLATFORM} from './materials'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';


/**
 * Structures
 **/


export interface GeoFile {
	geometry: Geometry; // Geometry property means 'geometry' Tag
}

interface Rooms {
	room: Room | Room[]
}

interface Room {
	id: string;
	caption: string;
	subroom: Subroom;
}

interface Subroom {
	id: string;
	caption: string;
	closed: string;
	class: string;
	polygon: Polygon | Polygon[];
	A_x: string;
	B_y: string;
	C_z: string
	up: Up;
	down: Down;

}

interface Up{
	px: string;
	py: string
}

interface Down{
	px: string;
	py: string
}

interface Polygon {
	caption: string;
	vertex: Vertex[];
}

interface Vertex {
	px: string;
	py: string
}

interface Transitions{
	transition: Transition | Transition[];
}

interface Transition {
	id: string;
	caption: string;
	type: string;
	room1_id: string;
	room2_id: string;
	vertex: Vertex[];
}

/**
 * A class to contain information and methods for geometry
 **/

export default class Geometry {
	private readonly geoFile: GeoFile;
	private version: string;
	private unit: string;
	private rooms: Rooms;
	private transitions: Transitions;

	constructor (file: GeoFile) {
		this.geoFile = file;

		if(this.validateFile(this.geoFile) === false){
			console.error('Program exited!');
			return;
		}

		this.version = file.geometry.version;
		this.unit = file.geometry.unit;
		this.rooms = file.geometry.rooms;
		this.transitions = file.geometry.transitions;
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

	createGround(subroom: Subroom): three.BoxBufferGeometry{
		let maxX: number;
		let minX: number;
		let maxY: number;
		let minY: number;

		if(Array.isArray(subroom.polygon)){
			maxX = parseFloat(subroom.polygon[0].vertex[0].px);
			minX = parseFloat(subroom.polygon[0].vertex[0].px);
			minY = parseFloat(subroom.polygon[0].vertex[0].py);
			maxY = parseFloat(subroom.polygon[0].vertex[0].py);

			for(let i = 0; i < (subroom.polygon as Polygon[]).length; i++){
				const point1 = subroom.polygon[i].vertex[0];
				const point2 = subroom.polygon[i].vertex[1];
				if(parseFloat(point1.px) >= maxX){
					maxX = parseFloat(point1.px);
				}else if(parseFloat(point1.px) <= minX){
					minX = parseFloat(point1.px);
				}

				if(parseFloat(point1.py) >= maxY){
					maxY = parseFloat(point1.py);
				}else if(parseFloat(point1.py) <= minY){
					minY = parseFloat(point1.py);
				}

				if(parseFloat(point2.px) >= maxX){
					maxX = parseFloat(point2.px);
				}else if(parseFloat(point2.px) <= minX){
					minX = parseFloat(point2.px);
				}

				if(parseFloat(point2.py) >= maxY){
					maxY = parseFloat(point2.py);
				}else if(parseFloat(point2.py) <= minY){
					minY = parseFloat(point2.py);
				}
			}
		}else {
			const ground = new three.BoxBufferGeometry(0, 0, 0);
			return ground;
		}

		const length = Math.abs(maxX - minX);
		const width  = Math.abs(maxY - minY);

		const ground = new three.BoxBufferGeometry(length, 0.01, width);
		ground.translate((maxX + minX)/2, 0, -(maxY + minY)/2); // Revolve y axes

		return ground;
	}

	createRooms(): three.Group{
		const roomGroup = new three.Group();
		roomGroup.name = 'Rooms';

		if(Array.isArray(this.rooms.room))
		{
			for(let i = 0; i < (this.rooms.room as Room[]).length; i++) {
				// A room must has only one subroom
				roomGroup.add(this.makeSubroom((this.rooms.room as Room[])[i].subroom));
			}
		}else{
			roomGroup.add(this.makeSubroom((this.rooms.room as Room).subroom));
		}



		return roomGroup;
	}


	createTransitions(): three.Group{
		const transitionGroup = new three.Group();
		transitionGroup.name = 'Transitions'

		if((this.transitions.transition !== null)
			&& Array.isArray(this.transitions.transition) )
		{
			for(let i = 0; i < (this.transitions.transition as Transition[]).length; i++) {
				const transitionMesh = new three.Mesh(this.makeTransition((this.transitions.transition as Transition[])[i]), TRANSITION)
				transitionGroup.add(transitionMesh);
			}
		}else {
			const transitionMesh = new three.Mesh(this.makeTransition(this.transitions.transition as Transition), TRANSITION);
			transitionGroup.add(transitionMesh);
		}

		return transitionGroup;

	}

	//TODO: Refactoring generics to reduce duplicated code in makePolygon
	protected makeTransition(transition: Transition): three.BoxBufferGeometry{
		if(transition.vertex.length != 2){
			console.error( 'The format of polygon is wrong', transition );
			return;
		}else {
			const point1: three.Vector2 = new three.Vector2(parseFloat(transition.vertex[0].px),
				parseFloat(transition.vertex[0].py));
			const point2: three.Vector2 = new three.Vector2(parseFloat(transition.vertex[1].px),
				parseFloat(transition.vertex[1].py));

			// Length of wall
			// length = sqrt(|x1-x2|*|x1-x2| + |y1-y2|*|y1-y2|)
			const length: number = Math.sqrt(Math.pow(Math.abs(point1.x - point2.x),2)
				+ Math.pow(Math.abs(point1.y - point2.y),2));

			// Rotation angle
			// angle = arctan(|y1-y2|/|x1-x2|) * PI/180
			const angle = Math.atan2(Math.abs(point1.y - point2.y), Math.abs(point1.x - point2.x));

			const exit: three.BoxBufferGeometry = new three.BoxBufferGeometry(length,1,0.05);
			exit.rotateY(angle);


			// Elevation
			const room1Id = transition.room1_id;
			const room2Id = transition.room2_id;

			let elevation = 0;
			if(Array.isArray(this.rooms.room)){
				for(let i = 0; i<(this.rooms.room as Room[]).length; i++){
					if((this.rooms.room[i].id === room1Id || this.rooms.room[i].id === room2Id)
						&& this.rooms.room[i].subroom.class != 'stair'){
						elevation = parseFloat(this.rooms.room[i].subroom.C_z)
						break;
					}
				}
			}else {
				// Only 1 room, there can't be a stair, transition between room and outside
				// Using C_z from subroom directly
				elevation = parseFloat(this.rooms.room.subroom.C_z);
			}

			exit.translate((point1.x + point2.x)/2, elevation+0.5, -(point1.y + point2.y)/2); // Revolve y axes
			return exit;
		}
	}

	protected makeSubroom (subroom: Subroom): three.Mesh {
		let subroomGeometry: three.BufferGeometry;

		if(Array.isArray(subroom.polygon)){
			// Subroom is stair
			if(subroom.class === 'stair'){
				const stairGeometry = this.makeStair(subroom);
				const stairMesh = new three.Mesh(stairGeometry, STAIR);
				stairMesh.name = subroom.caption;
				return stairMesh;

			}else if(subroom.class === 'platform'){
				// Subroom is platform
				const platformGeometry = this.makePlatform(subroom);
				const platformMesh = new three.Mesh(platformGeometry, PLATFORM);

				// As a subroom, A_x and B_y will always be 0
				const elevation = parseFloat(subroom.C_z);
				platformMesh.translateY(elevation);

				platformMesh.name = subroom.caption;
				return platformMesh;
			}
			else {
				// Subroom has multi walls
				const polygons: three.BufferGeometry[] = [];

				for (let i = 0; i < (subroom.polygon as Polygon[]).length; i++) {
					polygons.push(this.makePolygon(subroom.polygon[i]));

				}

				polygons.push(this.createGround(subroom)); // Make a ground for subroom
				subroomGeometry = BufferGeometryUtils.mergeBufferGeometries(polygons);
			}

		}else{
			// Subroom has only one wall
			subroomGeometry = this.makePolygon((subroom.polygon as Polygon));
		}

		const subroomMesh = new three.Mesh(subroomGeometry, BUILDING);

		// As a subroom, A_x and B_y will always be 0
		const elevation = parseFloat(subroom.C_z);
		subroomMesh.translateY(elevation);

		subroomMesh.name = subroom.caption;

		return subroomMesh;
	}

	protected makePlatform (subroom: Subroom): three.BufferGeometry {
		let platformGeometry: three.BufferGeometry;

		if(Array.isArray(subroom.polygon)){
			const tracks: three.BufferGeometry[] = [];

			for (let i = 0; i < (subroom.polygon as Polygon[]).length; i++) {
				const point1: three.Vector2  = new three.Vector2(parseFloat(subroom.polygon[i].vertex[0].px),
					parseFloat(subroom.polygon[i].vertex[0].py));
				const point2: three.Vector2 = new three.Vector2(parseFloat(subroom.polygon[i].vertex[1].px),
					parseFloat(subroom.polygon[i].vertex[1].py));

				// Length of wall
				// length = sqrt(|x1-x2|*|x1-x2| + |y1-y2|*|y1-y2|)
				const length: number = Math.sqrt(Math.pow(Math.abs(point1.x - point2.x),2)
					+ Math.pow(Math.abs(point1.y - point2.y),2));

				// Rotation angle
				// angle = arctan(|y1-y2|/|x1-x2|) * PI/180
				const angle = Math.atan2(Math.abs(point1.y - point2.y), Math.abs(point1.x - point2.x));

				const track: three.BoxBufferGeometry = new three.BoxBufferGeometry(length,0.2,0.1);
				track.rotateY(-angle);
				track.translate((point1.x + point2.x)/2, 0.5, - (point1.y + point2.y)/2); // Revolve y axes

				tracks.push(track);
			}

			platformGeometry = BufferGeometryUtils.mergeBufferGeometries(tracks);
		}

		return platformGeometry;
	}

	protected makePolygon (polygon: Polygon): three.BoxBufferGeometry {
		if(polygon.vertex.length != 2){
			console.error( 'The format of polygon is wrong', polygon );
			return;
		}else {
			const point1: three.Vector2  = new three.Vector2(parseFloat(polygon.vertex[0].px),
				parseFloat(polygon.vertex[0].py));
			const point2: three.Vector2 = new three.Vector2(parseFloat(polygon.vertex[1].px),
				parseFloat(polygon.vertex[1].py));

			// Length of wall
			// length = sqrt(|x1-x2|*|x1-x2| + |y1-y2|*|y1-y2|)
			const length: number = Math.sqrt(Math.pow(Math.abs(point1.x - point2.x),2)
				+ Math.pow(Math.abs(point1.y - point2.y),2));

			// Rotation angle
			// angle = arctan(|y1-y2|/|x1-x2|)
			// const angle = Math.atan2(Math.abs(point1.y - point2.y), Math.abs(point1.x - point2.x));
			const angle = - Math.atan2(point1.y - point2.y, point1.x - point2.x);
			const wall: three.BoxBufferGeometry = new three.BoxBufferGeometry(length,1,0.1);
			wall.rotateY(-angle);
			wall.translate((point1.x + point2.x)/2, 0.5, - (point1.y + point2.y)/2); // Revolve y axes

			return wall;
		}
	}

	protected makeStair(subroom: Subroom): three.BoxBufferGeometry{
		const polygon1: Polygon = (subroom.polygon as Polygon[])[0];
		const polygon2: Polygon = (subroom.polygon as Polygon[])[1];

		// Vertexs on polygon1
		const point1: three.Vector2 = new three.Vector2(parseFloat(polygon1.vertex[0].px),
			parseFloat(polygon1.vertex[0].py));
		const point2: three.Vector2 = new three.Vector2(parseFloat(polygon1.vertex[1].px),
			parseFloat(polygon1.vertex[1].py));

		// Vertexs on polygon2
		const point3: three.Vector2 = new three.Vector2(parseFloat(polygon2.vertex[0].px),
			parseFloat(polygon2.vertex[0].py));
		const point4: three.Vector2 = new three.Vector2(parseFloat(polygon2.vertex[1].px),
			parseFloat(polygon2.vertex[1].py));

		const center: three.Vector2 = new three.Vector2((point1.x + point2.x + point3.x + point4.x)/4,
			(point1.y + point2.y + point3.y + point4.y)/4);

		const width1: number = Math.sqrt(Math.pow(Math.abs(point1.x - point3.x),2)
			+ Math.pow(Math.abs(point1.y - point3.y),2));
		const width2: number = Math.sqrt(Math.pow(Math.abs(point1.x - point4.x),2)
			+ Math.pow(Math.abs(point1.y - point4.y),2));

		let width: number;
		if(width1 <= width2){
			width = width1;
		}else {
			width = width2;
		}

		// RotationY angle
		let angleY = 0;
		if((point1.x <= point2.x && point1.y <= point2.y) || (point1.x >= point2.x && point1.y >= point2.y)){
			// Gradient of Polygon1 is positive
			angleY = Math.atan2(Math.abs(point1.y - point2.y), Math.abs(point1.x - point2.x));
		}else {
			angleY = Math.PI/2 - Math.atan2(Math.abs(point1.y - point2.y), Math.abs(point1.x - point2.x));
		}

		// RotationX angle
		const Ax = parseFloat(subroom.A_x);
		const By = parseFloat(subroom.B_y);
		const Cz = parseFloat(subroom.C_z);

		const upX: number = parseFloat(subroom.up.px);
		const upY: number = parseFloat(subroom.up.py);
		const downX: number = parseFloat(subroom.down.px);
		const downY: number = parseFloat(subroom.down.py);

		const elevationUp: number = upX * Ax + upY * By + Cz;
		const elevationDown: number = downX * Ax + downY * By + Cz;
		const heightDifference = Math.abs(elevationUp - elevationDown);

		// Length of stair
		// length = sqrt(pow(heightDifference,2) + pow(projection,2))

		const projection: number = Math.sqrt(Math.pow(Math.abs(point1.x - point2.x),2)
			+ Math.pow(Math.abs(point1.y - point2.y),2));
		const length: number = Math.sqrt(Math.pow(projection,2)
			+ Math.pow(heightDifference,2));

		let angleZ: number;

		if(upY === downY){
			if(upX > downX){
				// Gradient of the stair is positive
				angleZ = Math.atan2(heightDifference, projection);
			}else if(upX < downX) {
				// Gradient of the stair is negative
				angleZ = -Math.atan2(heightDifference, projection);
			}else{
				console.error('Rendering stairs failed, the points of stair are same!')
				return;
			}
		}
		else if (upX === downX){
			if(upY > downY){
				// Gradient of the stair is positive
				angleZ = - Math.atan2(heightDifference, projection);
			}else if(upY < downY) {
				// Gradient of the stair is negative
				angleZ =  Math.atan2(heightDifference, projection);
			}else{
				console.error('Rendering stairs failed, the points of stair are same!')
				return;
			}
		}else {
			console.error('Rendering stairs failed, the direction of stair isn\'t parallel to X axis or Y axis!')
			return;
		}

		// Mesh
		const stair: three.BoxBufferGeometry = new three.BoxBufferGeometry(length,0.01,width);

		stair.rotateZ(-angleZ);
		stair.rotateY(angleY);

		stair.translate(center.x, (elevationUp + elevationDown)/2, -center.y);  // Revolve y axes

		return stair;
	}


}

















