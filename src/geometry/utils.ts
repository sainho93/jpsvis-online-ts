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

/** Return a flat mesh from a polygon's vertices. The polygon will have y=0. */

function shapeFromVertices(vertices: number[][]) {
	const shape = new three.Shape();
	shape.moveTo(vertices[0][0], vertices[0][1]);
	for (let i = 1; i < vertices.length; i++) {
		const [x, y] = vertices[i];
		shape.lineTo(x, y);
	}
	shape.closePath();
	return shape;
}

// Add UV mappings to geometries which lack them.
function addUVMappingToGeometry(geometry: three.Geometry) {
	// See https://stackoverflow.com/a/27317936/388951
	geometry.computeBoundingBox();
	const {min, max} = geometry.boundingBox;
	const offset = new three.Vector2(0 - min.x, 0 - min.y);
	const range = new three.Vector2(max.x - min.x, max.y - min.y);
	const faces = geometry.faces;

	geometry.faceVertexUvs[0] = [];

	for (let i = 0; i < faces.length; i++) {
		const v1 = geometry.vertices[faces[i].a];
		const v2 = geometry.vertices[faces[i].b];
		const v3 = geometry.vertices[faces[i].c];

		geometry.faceVertexUvs[0].push([
			new three.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
			new three.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
			new three.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y),
		]);
	}
	geometry.uvsNeedUpdate = true;
}

export function flatMeshFromVertices(vertices: number[][], material: three.Material) {
	const shape = shapeFromVertices(vertices);
	const geometry = new three.ShapeGeometry(shape);
	addUVMappingToGeometry(geometry);


	const mesh = new three.Mesh(geometry, material);
	mesh.material.side = three.DoubleSide; // visible from above and below.
	mesh.rotation.set(Math.PI / 2, 0, 0);
	return mesh;
}


