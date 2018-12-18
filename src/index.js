import './styles.scss';
import render from './render';

const appElement = document.getElementById('app');

const renderApp = () => {
	// cancel previous request
	if(window.animationFrameRequest !==null)
	{
		cancelAnimationFrame(window.animationFrameRequest);
	}

	// cleaning dom
	while (appElement.firstChild) {
	    appElement.removeChild(appElement.firstChild);
	}

	const canvasElement = document.createElement('canvas');
	appElement.appendChild(canvasElement);

	render(canvasElement);
};

renderApp();

if (module.hot) {
 	module.hot.accept('./render.js', function() {
    	renderApp();
  	});
}