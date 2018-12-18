import {Object3D} from 'three';

const PI_2 = Math.PI / 2;

export default class Controller {
	element = null;
	isLocked = false;
	object = false;
	pitchObject = null;
	yawObject = null;
	world = null;


	constructor(object, element, world)
	{
		this.element = element || document.body;
		this.isLocked = false;

		this.world = world;

		this.object = object;
		this.object.rotation.set(0, 0, 0);


		this.pitchObject = new Object3D();
		this.pitchObject.add(this.object);

		this.yawObject = new Object3D();
		this.yawObject.position.y = 10;
		this.yawObject.add(this.pitchObject);

		document.addEventListener('mousemove', (event) => this.onMouseMove(event), false);
		document.addEventListener('pointerlockchange', (event) => this.onPointerLockChange(event), false);
		document.addEventListener('pointerlockerror', (event) => this.onPointerLockError(event), false);


		let blocker = document.getElementById('pointerLockBlocker');
		if(!blocker)
		{
			blocker = document.createElement('div');
			blocker.id = 'pointerLockBlocker';

			let button = document.getElementById('div');
			button.innerHTML = 'Click to play' +
				'<br/>' +
				'(W, A, S, D = Move, SPACE = Jump, MOUSE = Look around)';

			button.addEventListener('click', () => {
				window.postMessage({ type: 'POINTER_LOCK_CONTROLLER/LOCK'});
			}, false);

			blocker.appendChild(button);

			document.body.prepend(blocker);
		}

		window.addEventListener('message', (event) => {
			if(event.data.type ==='POINTER_LOCK_CONTROLLER/LOCK')
			{
				this.lockPointer();
			}
		}, false);


		console.log('pointer lock init')
	}

	getObject()
	{
		return this.yawObject;
	}

	animate()
	{

	}

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


	destructor()
	{

	}
}