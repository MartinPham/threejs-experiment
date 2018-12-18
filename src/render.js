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
	Float32BufferAttribute,
	PlaneBufferGeometry,
	VertexColors,
	MeshPhongMaterial,
	BoxBufferGeometry
} from 'three';

import PointerLockController from './controllers/PointerLockController';
import KeyboardController from './controllers/KeyboardController';

class World {
	scene = null;
	camera = null;

	light = null;
	floor = null;

	controllers = {};


	objects = [];





	constructor()
	{
		// create camera
		this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

		// create scene
		this.scene = new Scene();

		// scene properties
		this.scene.background = new Color(0xffffff);
		this.scene.fog = new Fog(0xffffff, 0, 750);

		// create light
		this.light = new HemisphereLight(0xeeeeff, 0x777788, 0.75);
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
		this.scene.add(this.floor);



		// adding boxes
		let boxGeometry = new BoxBufferGeometry(20, 20, 20);
		boxGeometry = boxGeometry.toNonIndexed(); // ensure each face has unique vertices
		position = boxGeometry.attributes.position;
		colors = [];
		for (let i = 0, l = position.count; i < l; i++) {
			color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
			colors.push(color.r, color.g, color.b);
		}
		boxGeometry.addAttribute('color', new Float32BufferAttribute(colors, 3));
		for (let i = 0; i < 500; i++) {
			let boxMaterial = new MeshPhongMaterial({
				specular: 0xffffff,
				flatShading: true,
				vertexColors: VertexColors
			});
			boxMaterial.color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
			let box = new Mesh(boxGeometry, boxMaterial);
			box.position.x = Math.floor(Math.random() * 20 - 10) * 20;
			box.position.y = Math.floor(Math.random() * 20) * 20 + 10;
			box.position.z = Math.floor(Math.random() * 20 - 10) * 20;
			this.scene.add(box);
			this.objects.push(box);
		}

		// creating control
		this.controllers['pointerLock'] = new PointerLockController(this.camera, null, this);
		this.controllers['keyboard'] = new KeyboardController(this.controllers['pointerLock'].getObject(), null, this);

		this.scene.add(this.controllers['keyboard'].getObject());


		console.log('world init')
	}

	animate()
	{
		this.controllers['pointerLock'].animate();
		this.controllers['keyboard'].animate();
	}

	destructor()
	{
	}
}

window.world = null;
window.renderer = null;

const renderCycle = () => {
	window.animationFrameRequest = requestAnimationFrame(renderCycle);

	const world = window.world;
	const renderer = window.renderer;

	world.animate();
	renderer.render(world.scene, world.camera);
};


export default (canvasElement) => {
	// Create a renderer with Antialiasing
	window.renderer = new WebGLRenderer({
		antialias: true,
		canvas: canvasElement
	});

	window.renderer.setPixelRatio(window.devicePixelRatio);

	// Configure renderer clear color
	window.renderer.setClearColor("#000000");

	// Configure renderer size
	window.renderer.setSize(window.innerWidth, window.innerHeight);

	// create world
	window.world = new World();

	// start
	renderCycle();

	console.log('render')
}