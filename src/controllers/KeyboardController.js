import {Object3D, Raycaster, Vector3} from 'three';


export default class Controller {
	object = null;
	world = null;


	moveForward = false;
	moveBackward = false;
	moveLeft = false;
	moveRight = false;
	canJump = false;
	raycaster = null;

	prevTime = performance.now();

	velocity = new Vector3();
	direction = new Vector3();

	constructor(object, element, world)
	{
		this.element = element || document.body;
		this.object = object;

		this.world = world;
		this.raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 10);

		document.addEventListener('keydown', (event) => this.onKeyDown(event), false);
		document.addEventListener('keyup', (event) => this.onKeyUp(event), false);

		console.log('keyboard init')
	}


	getObject()
	{
		return this.object;
	}

	animate()
	{
		// console.log(
		// 	this.moveForward
		// );

		// this.object.translateX(0.010);
		// this.object.translateZ(0.010);
		// this.object.translateY(0.010);
		//
		// return;

		let headObject = this.object;

		let scanDirections = {
			front: [0, 0, -1],
			behind: [0, 0, 1],
			left: [-1, 0, 0],
			right: [1, 0, 0],
			above: [0, 1, 0],
			bottom: [0, -1, 0],
		};

		let intersections = {};

		for(let scanDirection in scanDirections)
		{
			let directionVector = new Vector3(
				scanDirections[scanDirection][0],
				scanDirections[scanDirection][1],
				scanDirections[scanDirection][2]
			);

			directionVector.applyQuaternion(headObject.quaternion);
			this.raycaster.ray.origin.copy(headObject.position);
			this.raycaster.ray.direction.copy(directionVector);

			intersections[scanDirection] = this.raycaster.intersectObjects(this.world.objects);

			// for (var i = 0; i < intersections[scanDirection].length; i++) {
			//     intersections[scanDirection][i].object.material.color.set(0xff0000);
			// }
		}


		if (intersections.front.length > 0) {
			this.moveForward = false;
		}
		if (intersections.behind.length > 0) {
			this.moveBackward = false;
		}
		if (intersections.left.length > 0) {
			this.moveLeft = false;
		}
		if (intersections.right.length > 0) {
			this.moveRight = false;
		}

		let time = performance.now();
		let delta = (time - this.prevTime) / 1000;

		// console.log(delta)

		this.velocity.x -= this.velocity.x * 10.0 * delta;
		this.velocity.z -= this.velocity.z * 10.0 * delta;

		this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass



		this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
		this.direction.x = Number(this.moveLeft) - Number(this.moveRight);

		this.direction.normalize(); // this ensures consistent movements in all directions
		if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta;
		if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta;
		if (intersections.bottom.length > 0) {
			this.velocity.y = Math.max(0, this.velocity.y);
			this.canJump = true;
		}

		this.object.translateX(this.velocity.x * delta);
		this.object.translateZ(this.velocity.z * delta);

		this.object.translateY(this.velocity.y * delta);
		if (this.object.position.y < 10) {
			this.velocity.y = 0;
			this.object.position.y = 10;
			this.canJump = true;
		}

		if (intersections.above.length > 0) {
			this.canJump = false;
		}
		this.prevTime = time;

		// console.log(
		// 	this.velocity.x * delta,
		// 	this.velocity.y * delta,
		// 	this.velocity.z * delta,
		// )
	}

	onKeyDown = (event) => {
		// console.log(this.object)
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				this.moveForward = true;
				break;
			case 37: // left
			case 65: // a
				this.moveLeft = true;
				break;
			case 40: // down
			case 83: // s
				this.moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				this.moveRight = true;
				break;
			case 32: // space
				if (this.canJump === true) this.velocity.y += 350;
				this.canJump = false;
				break;
		}
	};


	onKeyUp = (event) => {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				this.moveForward = false;
				break;
			case 37: // left
			case 65: // a
				this.moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				this.moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				this.moveRight = false;
				break;
		}
	};

	destructor()
	{

	}
}