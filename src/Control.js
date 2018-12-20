import {
	Object3D,
	Raycaster,
	Vector3
} from 'three';

const PI_2 = Math.PI / 2;

export default class Control {
	element = null;
	isLocked = false;
	object = null;
	pitchObject = null;
	yawObject = null;

	moveForward = false;
	moveBackward = false;
	moveLeft = false;
	moveRight = false;
	moveDown = true;

	raycaster = null;

	prevTime = performance.now();

	velocity = new Vector3();
	direction = new Vector3();

	getObjects = () => [];

	constructor(object, element, getObjects)
	{
		this.element = element || document.body;
		this.isLocked = true;

		this.getObjects = getObjects;

		this.object = object;
		this.object.rotation.set(0, 0, 0);


		this.pitchObject = new Object3D();
		this.pitchObject.add(this.object);


		this.yawObject = new Object3D();
		this.yawObject.position.y = 100;
		this.yawObject.add(this.pitchObject);

		document.addEventListener('mousemove', (event) => this.onMouseMove(event), false);
		document.addEventListener('pointerlockchange', (event) => this.onPointerLockChange(event), false);
		document.addEventListener('pointerlockerror', (event) => this.onPointerLockError(event), false);


		let blocker = document.getElementById('pointerLockBlocker');
		if(!blocker)
		{
			blocker = document.createElement('div');
			blocker.id = 'pointerLockBlocker';
			blocker.innerHTML = 'MOUSE';

			blocker.addEventListener('click', () => {
				window.postMessage({ type: 'POINTER_LOCK_CONTROLLER/LOCK'});
			}, false);


			document.body.prepend(blocker);
		}

		window.addEventListener('message', (event) => {
			if(event.data.type ==='POINTER_LOCK_CONTROLLER/LOCK')
			{
				this.lockPointer();
			}
		}, false);




		this.raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 10);

		document.addEventListener('keydown', (event) => this.onKeyDown(event), false);
		document.addEventListener('touchstart', (event) => this.onKeyDown({
			keyCode: 87
		}), false);
		document.addEventListener('keyup', (event) => this.onKeyUp(event), false);
		document.addEventListener('touchend', (event) => this.onKeyUp({
			keyCode: 87
		}), false);
	}

	update()
	{
		if (this.isLocked === false) return;

		let headObject = this.getObject();


		let scanDirections = {
			front: [0, 0, -1],
			behind: [0, 0, 1],
			left: [-1, 0, 0],
			right: [1, 0, 0],
			above: [0, 1, 0],
			bottom: [0, -1, 0],
		};

		let intersections = {};

		let objects = this.getObjects();

		// console.log(objects)

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

			intersections[scanDirection] = this.raycaster.intersectObjects(objects, true);

			// for (var i = 0; i < intersections[scanDirection].length; i++) {
			//     intersections[scanDirection][i].object.material.color.set(0xff0000);
			// }
		}

		// console.log(intersections)


		if (intersections.front.length > 0) {
			console.log('cannot go front')
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
		if (intersections.bottom.length > 0) {
			this.moveDown = false;
		} else {
			this.moveDown = true;
		}

		let time = performance.now();
		let delta = (time - this.prevTime) / 1000;

		// console.log(delta)

		this.velocity.x -= this.velocity.x * 10.0 * delta;
		this.velocity.z -= this.velocity.z * 10.0 * delta;

		this.velocity.y -= 10; // 100.0 = mass



		this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
		this.direction.x = Number(this.moveLeft) - Number(this.moveRight);

		this.direction.normalize(); // this ensures consistent movements in all directions
		if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta;
		if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta;

		// if (intersections.bottom.length > 0) {
		// 	this.velocity.y = Math.max(0, this.velocity.y);
		// 	this.canJump = true;
		// }

		headObject.translateX(this.velocity.x * delta);
		headObject.translateZ(this.velocity.z * delta);

		if(this.moveDown)
		{
			if(headObject.position.y > 0)
			{
				headObject.translateY(this.velocity.y * delta);
			} 
// 			else {
// 				console.log('move up')
// 				headObject.position.set(0, 100, 0);
// 
// 				headObject.rotation.set(0, 0, 0);
// 			}
			
		}
		
		// console.log(headObject.position.y);
// 
// 		if (headObject.position.y < -10) {
// 
// 			this.velocity.y = 500;
// 		}


		this.prevTime = time;
	}



	getObject()
	{
		return this.yawObject;
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

	onMouseMove = (event) =>
	{
		if (this.isLocked === false) return;

		let movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		let movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		this.yawObject.rotation.y -= movementX * 0.002;
		this.pitchObject.rotation.x -= movementY * 0.002;

		this.pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitchObject.rotation.x));
	};

	onPointerLockChange = (event) =>
	{
		if (document.pointerLockElement === this.element) {
			this.isLocked = true;
			document.getElementById('pointerLockBlocker').style.display = 'none';
		} else {
			this.isLocked = false;
			document.getElementById('pointerLockBlocker').style.display = 'block';
		}
	};

	onPointerLockError = (event) =>
	{
		console.error('Unable to use Pointer Lock API');
	};

	lockPointer = (event) =>
	{
		this.element.requestPointerLock();
	};
}