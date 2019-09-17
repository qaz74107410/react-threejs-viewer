import React from 'react';
import {createGlobalStyle} from 'styled-components';
import {hot} from 'react-hot-loader/root';

// Import modern-normalize & fonts
import 'modern-normalize/modern-normalize.css';

// MDB base
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";

import { MDBContainer } from 'mdbreact';

import Workarea from "./components/workarea";
import ThreeWrapper from './components/threeWarpper';

// THREE setup
import { getCamera, getRenderer, getScene, getCanvas, getControl } from './components/threeSetup';
import Cube from './components/three/cube';

// Global Style
const GlobalStyle = createGlobalStyle`
  body {
    background: #f9f9f9;
    line-height: 1.8em;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeSpeed;
    word-wrap: break-word;
    height: 100vh;
    width: 100%;
		overflow: hidden;
  }
`;

// Main page
const App = () => {
	// Register service worker
	// if ('serviceWorker' in navigator) {
	// 	window.addEventListener('load', () => {
	// 		navigator.serviceWorker.register('/sw.js').then(registration => {
	// 			console.log('SW registered:', registration);
	// 		}).catch(error => {
	// 			console.log('SW registration failed:', error);
	// 		});
	// 	});
	// }

	const headerHeight = 38;
	const panelWidth = 320;

	return (
		<MDBContainer fluid>
			<GlobalStyle/>
      <ThreeWrapper 
				getCamera={ getCamera }
				getRenderer={ getRenderer }
				getScene={ getScene }
				getCanvas={ getCanvas }
				getControl={ getControl }
				headerHeight= { headerHeight }
				panelWidth= { panelWidth }
			>
				<Cube/>
			</ThreeWrapper>
			{/* <Header>Hello World ⚡</Header>
			<p>Example site using Styled React Boilerplate!</p>
			<Counter/> */}
		</MDBContainer>
	);
};

export default hot(App);
