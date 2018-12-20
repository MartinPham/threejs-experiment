import WebVRPolyfill from 'webvr-polyfill';

import './styles.scss';
import App from './App';
import WebVr from './WebVr';

import {WebGLRenderer} from 'three';

const polyfill = new WebVRPolyfill();

const appElement = document.getElementById('app');


let renderer = null;

let app = null;

let animationFrameRequest = null;

let updateLoop = () => {};

const render = (AppClass) => {
	// cancel previous request
	if(animationFrameRequest !==null)
	{
		cancelAnimationFrame(animationFrameRequest);
	}

	// cleaning dom
	while (appElement.firstChild) {
	    appElement.removeChild(appElement.firstChild);
	}
	
	const canvasElement = document.createElement('canvas');
	appElement.appendChild(canvasElement);


	// Create a renderer with Antialiasing
	renderer = new WebGLRenderer({
		antialias: true,
		canvas: canvasElement
	});

	renderer.setPixelRatio(window.devicePixelRatio);

	// Configure renderer clear color
	renderer.setClearColor("#000000");

	// Configure renderer size
	renderer.setSize(window.innerWidth, window.innerHeight);

	app = new AppClass(render.domElement);

	// clean vr button
	const webVrButton = document.getElementById('#WebVrButton');
	if(webVrButton)
	{
		document.body.removeChild(webVrButton);
	}

	// add vr
	document.body.appendChild(WebVr.createButton(renderer));
	renderer.vr.enabled = true;


	updateLoop = () => {
// 		app.update();
// 		renderer.render(app.scene, app.camera);
// 
// 		animationFrameRequest = requestAnimationFrame(updateLoop);

		renderer.setAnimationLoop(() => {
			app.update();
			renderer.render(app.scene, app.camera);
		});
	}

	updateLoop();
};




render(App);

if (module.hot) {
 	module.hot.accept('./App.js', function() {
		render(App);
		// location.reload();
  	});
}