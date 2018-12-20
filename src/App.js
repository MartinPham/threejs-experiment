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

import Control from './Control';

import GLTFLoader from 'three-gltf-loader';

import bookScene from './book/scene.gltf';
import './book/scene.bin';
import './book/textures/Texture-base_baseColor.jpg';
import './book/textures/Texture-base-gloss-jpg_baseColor.jpg';
import './book/textures/Book-tittle_baseColor.png';
import './book/textures/Book-tittle_emissive.jpg';


export default class App {
	scene = null;
	camera = null;

	

	light = null;
	floor = null;

	control = null;


	objects = [];
	

	mixer = null;

	domElement = null;

	constructor(domElement)
	{
		this.domElement = domElement;

		// create camera
		this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

		// create scene
		this.scene = new Scene();

		// scene properties
		this.scene.background = new Color(0xffffff);
		this.scene.fog = new Fog(0xffffff, 0, 750);

		// create light
		this.light = new HemisphereLight(0xeeeeff, 0x777788, 2.75);
		this.light.position.set(0.5, 1, 0.75);
		this.scene.add(this.light);




		// create floor
		let floorGeometry = new PlaneBufferGeometry(2000, 2000, 100, 100);
		floorGeometry.rotateX(-Math.PI / 2);
		let vertex = new Vector3();
		// vertex displacement
		let position = floorGeometry.attributes.position;
		for (let i = 0, l = position.count; i < l; i++) {
			vertex.fromBufferAttribute(position, i);
			vertex.x += Math.random() * 20 - 10;
			vertex.y += Math.random() * 2;
			vertex.z += Math.random() * 20 - 10;
			position.setXYZ(i, vertex.x, vertex.y, vertex.z);
		}
		floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices
		position = floorGeometry.attributes.position;
		let colors = [];
		let color = new Color();
		for (let i = 0, l = position.count; i < l; i++) {
			color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
			colors.push(color.r, color.g, color.b);
		}
		floorGeometry.addAttribute('color', new Float32BufferAttribute(colors, 3));
		let floorMaterial = new MeshBasicMaterial({vertexColors: VertexColors});
		this.floor = new Mesh(floorGeometry, floorMaterial);
		// this.scene.add(this.floor);
		// this.objects.push(this.floor);


		// adding boxes
		// let boxGeometry = new BoxBufferGeometry(20, 20, 20);
		// boxGeometry = boxGeometry.toNonIndexed(); // ensure each face has unique vertices
		// position = boxGeometry.attributes.position;
		// colors = [];
		// for (let i = 0, l = position.count; i < l; i++) {
		// 	color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
		// 	colors.push(color.r, color.g, color.b);
		// }
		// boxGeometry.addAttribute('color', new Float32BufferAttribute(colors, 3));
		// for (let i = 0; i < 300; i++) {
		// 	let boxMaterial = new MeshPhongMaterial({
		// 		specular: 0xffffff,
		// 		flatShading: true,
		// 		vertexColors: VertexColors
		// 	});
		// 	boxMaterial.color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
		// 	let box = new Mesh(boxGeometry, boxMaterial);
		// 	box.position.x = Math.floor(Math.random() * 20 - 10) * 20;
		// 	box.position.y = Math.floor(Math.random() * 20) * 20 + 10;
		// 	box.position.z = Math.floor(Math.random() * 20 - 10) * 20;
		// 	this.scene.add(box);
		// 	this.objects.push(box);
		// }

		(new GLTFLoader()).load(
			// resource URL
			bookScene,
			// called when the resource is loaded
			(gltf) => {
				const scale = 5;
				gltf.scene.scale.set(
					scale, scale, scale
				);
				gltf.scene.translateZ(-50);
				gltf.scene.rotation.y = -Math.PI / 2;
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

				this.objects.push(gltf.scene);

				// console.log(gltf.scene)
				// for(let i = 0; i < gltf.scene.children.length; i++)
				// {
				// 	console.log('add ' + i, gltf.scene.children[i]);
				// 	
				// 	// this.scene.add(gltf.scene.children[i]);
				// 	this.objects.push(gltf.scene.children[i]);
				// }


			},
			// called while loading is progressing
			(xhr) => {
				// if(document.getElementById('pointerLockBlocker'))
				// 	{
				// 		document.getElementById('pointerLockBlocker').innerHTML = ( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
				// 	}
				
			},
			// called when loading has errors
			(error) => {
				console.log( 'An error happened', error);
			}
		);


		// control
		this.control = new Control(this.camera, false, () => this.objects);

		this.scene.add(this.control.getObject());
	}

	update()
	{
		if(this.mixer !== null)
		{
			this.mixer.update(1/60);
		}


		this.control.update();
	}
}