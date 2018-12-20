import {
	Vector3,
	Face3,
	Geometry,
	MeshBasicMaterial,
	Mesh,
	MeshPhongMaterial
} from 'three';

import {
	Vec3,
	Body,
	ConvexPolyhedron
} from 'cannon';

export const generateThreeVertices = (rawVerts) => {
    let verts = [];

    for(let v = 0; v < rawVerts.length; v+=3){
        verts.push(new Vector3(rawVerts[v],
            rawVerts[v+1],
            rawVerts[v+2]));
    }

    return verts;
};

export const generateThreeFaces = (rawFaces) => {
    let faces = [];

    for(let f = 0; f < rawFaces.length; f+=3){
        faces.push(new Face3(rawFaces[f],
            rawFaces[f+1],
            rawFaces[f+2]));
    }

    return faces;
};


export const generateCannonVertices = (rawVerts) => {
    let verts = [];

    for(let v = 0; v < rawVerts.length; v++){
        verts.push(new Vec3(rawVerts[v].x,
            rawVerts[v].y,
            rawVerts[v].z));
    }

    return verts;
};

export const generateCannonFaces = (rawFaces) => {
    let faces = [];

    for(let f = 0; f < rawFaces.length; f++){
        faces.push([rawFaces[f].a,
            rawFaces[f].b,
            rawFaces[f].c]);
    }

    return faces;
};

export const generateObjects = (groups, properties) => {
    const body = new Body({
        mass: properties.mass
    });

    let mesh = null;


    for (let g = 0; g < groups.length; g++) {
        const group = groups[g];


    // console.log(group)

        const verts = generateThreeVertices(group.vertices);
        const faces = generateThreeFaces(group.faces);
        const geometry = new Geometry();
        // const material = new MeshBasicMaterial();
        const material = new MeshPhongMaterial({ 
			color: 0x00ff00
		});

        geometry.vertices = verts;
        geometry.faces = faces;

        mesh = new Mesh(geometry, material);

        mesh.scale.copy(properties.scale);

        mesh.updateMatrix();
        mesh.geometry.applyMatrix(mesh.matrix);
        mesh.geometry.computeFaceNormals();
        mesh.geometry.computeVertexNormals();
        mesh.matrix.identity();

        const updatedVerts = generateCannonVertices(mesh.geometry.vertices);
        const updatedFaces = generateCannonFaces(mesh.geometry.faces);

        const polyhedron = new ConvexPolyhedron(updatedVerts,updatedFaces);

        body.addShape(polyhedron);
    }

    return {
    	body,
    	mesh
    }
};