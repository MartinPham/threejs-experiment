import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	MeshBasicMaterial,
	Mesh,
	Vector3,
	Color,
	Fog,
	HemisphereLight,
	BoxGeometry,
	Float32BufferAttribute,
	PlaneBufferGeometry,
	VertexColors,
	MeshPhongMaterial,
	BoxBufferGeometry,
	MeshLambertMaterial,
	Matrix4,
	AnimationMixer
} from 'three';

import {
	World,
	NaiveBroadphase,
	Box,
	Vec3,
	Body,
	GSSolver,
	SplitSolver,
	Material,
	ContactMaterial,
	Sphere,
	Plane,
	Trimesh
} from 'cannon';

import GLTFLoader from 'three-gltf-loader';
import OBJLoader from 'three-obj-loader-es6-module';
import CannonDebugRenderer from './CannonDebugRenderer';
// import {VRMLLoader} from 'threejs-ext';
import VRMLLoader from './VRMLLoader';
import Control from './Control';
import WrlLoader from './WrlLoader';
import {generateObjects} from './utils';

import bookScene from './book/scene.gltf';
import './book/scene.bin';
import './book/textures/Texture-base_baseColor.jpg';
import './book/textures/Texture-base-gloss-jpg_baseColor.jpg';
import './book/textures/Book-tittle_baseColor.png';
import './book/textures/Book-tittle_emissive.jpg';

import lamp from './objects/lamp.obj';
import lampWrl from './objects/monster.wrl';

import { threeToCannon } from 'three-to-cannon';

let time = performance.now();

export default class App {
	scene = null;
	camera = null;

	world = null;

	light = null;
	floor = null;

	control = null;


	objects = [];
	objectMeshes = [];

	mixer = null;

	mesh = null;
	body = null;

	cannonDebugRenderer = null;

	constructor()
	{
		// create scene
		this.scene = new Scene();

		// scene properties
		this.scene.background = new Color(0x000000);
		this.scene.fog = new Fog(0xffffff, 0, 750);

		// create camera
		this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);


		// cannon
		this.world = new World();
		this.world.quatNormalizeSkip = 0;
		this.world.quatNormalizeFast = false;

		let solver = new GSSolver();
		this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
		this.world.defaultContactMaterial.contactEquationRelaxation = 4;
		solver.iterations = 7;
		solver.tolerance = 0.1;

		let split = true;
		if(split)
			this.world.solver = new SplitSolver(solver);
		else
			this.world.solver = solver;

		this.world.gravity.set(0,-20,0);
		this.world.broadphase = new NaiveBroadphase();
		// Create a slippery material (friction coefficient = 0.0)
		let physicsMaterial = new Material("slipperyMaterial");
		let physicsContactMaterial = new ContactMaterial(physicsMaterial,
			physicsMaterial,
			0.0, // friction coefficient
			0.3  // restitution
		);
		// We must add the contact materials to the world
		this.world.addContactMaterial(physicsContactMaterial);


		// debug
		this.cannonDebugRenderer = new CannonDebugRenderer(this.scene, this.world);



		// create light
		this.light = new HemisphereLight(0xeeeeff, 0x777788, 0.75);
		this.light.position.set(0.5, 1, 4.75);
		this.scene.add(this.light);




		// create floor
		let floorGeometry = new PlaneBufferGeometry(2000, 2000, 100, 100);
		// floorGeometry.rotateX(-Math.PI / 2);
		floorGeometry.applyMatrix( new Matrix4().makeRotationX( - Math.PI / 2 ) );

		let floorMaterial = new MeshLambertMaterial( { color: 0xdddddd } );
		this.floor = new Mesh( floorGeometry, floorMaterial );
		this.floor.castShadow = true;
		this.floor.receiveShadow = true;
		this.scene.add( this.floor );

		// Create a plane
		let groundShape = new Plane();
		let groundBody = new Body({ mass: 0 });
		groundBody.addShape(groundShape);
		groundBody.quaternion.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);
		this.world.addBody(groundBody);





		// Create a chracter sphere
		let mass = 5, radius = 1.3;
		let sphereShape = new Sphere(radius);
		let sphereBody = new Body({ mass: mass });
		sphereBody.addShape(sphereShape);
		sphereBody.position.set(0,5,0);
		sphereBody.linearDamping = 0.9;
		this.world.addBody(sphereBody);


		(new VRMLLoader).load(
			// resource URL
			lampWrl,
			// called when resource is loaded
			(object) => {
				// const scale = 0.1;
				// object.scale.set(
				// 	scale, scale, scale
				// );
				console.log(object)

				// const x = 0;
				// const y = 20;
				// const z = -5;

				object.position.set(0, 5, -5);
				this.scene.add(object);
				this.objectMeshes.push(object);

					//get vertices
					var verticesArray = [];
					var verticesTemporaryArray = [];
					var Vec3Vertices;
					for(var x=0;x<object.children.length;x++){
					    Vec3Vertices = object.children[x].parent.children[x].children["0"].geometry.vertices;
					    if(Vec3Vertices)
							for(var y =0;y<Vec3Vertices.length;y++){
							verticesTemporaryArray.push(Vec3Vertices[y].x);
							verticesTemporaryArray.push(Vec3Vertices[y].y);
							verticesTemporaryArray.push(Vec3Vertices[y].z);
							}
							verticesArray.push(verticesTemporaryArray);
							//console.log(verticesTemporaryArray); //moje obiekty
							verticesTemporaryArray = [];
							
					}
					// console.log(verticesArray);

		 
				
				//get faces
					var facesArray = [];
					var facesTemporaryArray = [];
					var Vec3faces;
					for(var x=0;x<object.children.length;x++){
					    Vec3faces = object.children[x].parent.children[x].children["0"].geometry.faces;
					    if(Vec3faces)
							for(var y =0;y<Vec3faces.length;y++){
							facesTemporaryArray.push(Vec3faces[y].a);
							facesTemporaryArray.push(Vec3faces[y].b);
							facesTemporaryArray.push(Vec3faces[y].c);
							}
							facesArray.push(facesTemporaryArray);
							//console.log(verticesTemporaryArray); //moje obiekty
							facesTemporaryArray = [];
							
					}
					// console.log(facesArray);
					
					//loop through groups of model
					var modelGroupsArray = [];
					for(var g=0;g<object.children.length;g++){
					modelGroupsArray.push(new Trimesh(verticesArray[g], facesArray[g]));
					}
					
					
					var body3 = new Body({
						mass: 10
					});         
					body3.position = new Vec3(0,5,2);
					//add shape to body
					for(var g=0;g<object.children.length;g++){
						body3.addShape(modelGroupsArray[g]);
					}
					   
					// var rot = new CANNON.Vec3(1,0,0)
					// body3.quaternion.setFromAxisAngle(rot,-(Math.PI/2))		                   
					//body3.angularVelocity.set(0,10,0);
					// body3.angularDamping = 0.6;
					console.log(body3);
					this.world.addBody(body3); //add monster 
				
/*
				const shape = threeToCannon(object, {type: threeToCannon.Type.CYLINDER});
				const body = new Body({ mass: 5 });
				body.addShape(boxShape);
				body.position.set(x,y,z);
				this.world.addBody(body);
				this.objects.push(body);
*/
// 				(new WrlLoader).load(
// 					lampWrl
// 				).then(groups => {
// 					console.log(groups)
// 					const {body, mesh} = generateObjects(groups, {
// 						mass: 5,
// 						scale: 1
// 					});
// 
// 					// mesh.position.set(0,10,-15);
// 					body.position.set(x, y, z);
// 
// 					// this.objects.push(body);
// 					// this.objectMeshes.push(mesh);
// 					// this.objectMeshes.push(object);
// 
// 					// this.scene.add(mesh);
// 					this.world.addBody(body);
// 
// 					console.log(mesh, body)
// 				})
			},
			// called when loading is in progresses
			( xhr ) => {

				console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

			},
			// called when loading has errors
			( error ) => {

				console.log( 'An error happened' );

			}
		);


		// boxes
		let halfExtents = new Vec3(1, 1, 1);
		let boxShape = new Box(halfExtents);
		let boxMaterial = new MeshPhongMaterial({ 
			color: 0xff0000
		});
		let boxGeometry = new BoxGeometry(halfExtents.x*2, halfExtents.y*2, halfExtents.z*2);
		for(let i=0; i<1; i++){
			let x = (Math.random()-0.5)*20;
			let y = 1 + (Math.random())*1;
			let z = (Math.random()-0.5)*20;

			x = 0;
			y = 5;
			z = -15;

			let boxMesh = new Mesh(boxGeometry, boxMaterial);
			boxMesh.position.set(x,y,z);
			boxMesh.castShadow = true;
			boxMesh.receiveShadow = true;

			this.scene.add(boxMesh);


			let boxBody = new Body({ mass: 5 });
			boxBody.addShape(boxShape);
			boxBody.position.set(x,y,z);

			this.world.addBody(boxBody);

			this.objectMeshes.push(boxMesh);
			this.objects.push(boxBody);
		}

		/*
		(new GLTFLoader()).load(
			// resource URL
			bookScene,
			// called when the resource is loaded
			(gltf) => {
				const scale = 5;
				gltf.scene.scale.set(
					scale, scale, scale
				);
				this.scene.add(gltf.scene);

				// gltf.animations; // Array<THREE.AnimationClip>
				// gltf.scene; // THREE.Scene
				// gltf.scenes; // Array<THREE.Scene>
				// gltf.cameras; // Array<THREE.Camera>
				// gltf.asset; // Object
				
				// console.log(animations)
				this.mixer = new AnimationMixer(gltf.scene);
				const clips = gltf.animations;

				// Play all animations
				clips.forEach(clip => {
					this.mixer.clipAction(clip).play();
				});


			},
			// called while loading is progressing
			(xhr) => {

				console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

			},
			// called when loading has errors
			(error) => {

				console.log( 'An error happened', error);

			}
		);
		*/

		// creating control
		this.control = new Control(this.camera , sphereBody );
		this.scene.add(this.control.getObject());


		console.log(
			this.objects,
			this.objectMeshes
			)
	}

	update()
	{
		this.cannonDebugRenderer.update();

		if(this.mixer !== null)
		{
			this.mixer.update(1/60);
		}

		// Step the physics world
		this.world.step(1/60);


		// Update box positions
		for(let i = 0; i < this.objects.length; i++){
			this.objectMeshes[i].position.copy(this.objects[i].position);
			this.objectMeshes[i].quaternion.copy(this.objects[i].quaternion);
		}

		this.control.update(performance.now() - time);

		time = performance.now();
	}
}