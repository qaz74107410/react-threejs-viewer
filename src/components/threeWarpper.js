import React, { useReducer, useState, createContext, useRef, useEffect, useLayoutEffect } from 'react';
import { MDBRow } from 'mdbreact';

import Workarea from './workarea';
import Headers from "./header";
import Panel from "./panel";

// Reducer
import { menuState, menuReducer } from "../reducer/menu";


export const ThreeJSContext = createContext();

const ThreeWrapper = ({
  children,
  getCamera,
  getRenderer,
  getScene,
  getControl,
  headerHeight,
  panelWidth
}) => {

  // Menu reducer WIP
  const [stateMenu, dispatchMenu] = useReducer(menuReducer, menuState)

  const [threeIsReady, setThreeIsReady] = useState(false);
  const [timer, updateTimer] = useState(0);
  const [animateFn, setAnimateFn] = useState([]);
  
  // Reference 
  const canvasRef = useRef({});
  const sceneRef = useRef();
  const cameraRef = useRef();
  const controlRef = useRef();
  const rendererRef = useRef();
  const headerRef = useRef();
  const panelRef = useRef();
  
  // Style state
  const [headerStyle, setHeaderStyle] = useState({ height: headerHeight, boxShadow: 'inset 0px -5px 30px -10px rgba(0,0,0,0.3)' });
  const [panelStyle, setPanelStyle] = useState({ height: document.body.clientHeight - headerStyle.height, width: panelWidth });
  const [containerStyle, setContainerStyle] = useState({ height: document.body.clientHeight - headerStyle.height, width: document.body.clientWidth - panelWidth });
  const [canvasStyle, setCanvasStyle] = useState({ height: window.innerHeight - headerStyle.height, width: window.outerWidth });
  
  // Event
  const onWindowResize = () => {
    cameraRef.current.aspect = canvasRef.current.offsetWidth / canvasRef.current.offsetHeight;
    cameraRef.current.updateProjectionMatrix();

    rendererRef.current.setSize( canvasRef.current.offsetWidth, canvasRef.current.offsetHeight );
  };

  const setContainerSize = () => {
    setContainerStyle({ height: window.innerHeight - headerStyle.height, width: window.innerWidth - panelWidth });
  }

  // Context
  const { offsetWidth, offsetHeight } = canvasRef.current;
  const threeContext = {
    scene: sceneRef.current,
    camera: cameraRef.current,
    canvas: canvasRef.current,
    control: controlRef.current,
    header: headerRef.current,
    panel: panelRef.current,
    setAnimateFn,
    timer,
  };

  // setup scene, camera, and renderer, and store references
  useEffect(() => {
    const canvas = canvasRef.current;
    sceneRef.current = getScene();
    rendererRef.current = getRenderer(canvas);
    cameraRef.current = getCamera(canvas);
    controlRef.current = getControl(cameraRef.current, canvas);

    setThreeIsReady(true);
  }, []);

  // update camera and renderer when dimensions change
  useEffect(
    () => {
      cameraRef.current.aspect = offsetWidth / offsetHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(offsetWidth, offsetHeight);
    },
    [offsetWidth, offsetHeight],
  );

  // resize event
  useEffect(() => {
    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  // three js animate and render
  const animate = () => {
    animateFn.forEach(fn => {
      fn();
    });
    render();
    window.requestAnimationFrame(animate);
    // console.log('animate 😃');
  }

  const render = () => {
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }

  useEffect(() => {
    if ( threeIsReady ) {
      animate();
    }
  }, [threeIsReady])

  return (
    <>
      <ThreeJSContext.Provider value={ threeContext }>
        <Headers
          ref={ headerRef }
          headerStyle={ headerStyle }
        />
        <MDBRow>
          <Workarea 
            ref={ canvasRef }
            canvasStyle={ canvasStyle }
            containerStyle={ containerStyle }
            setContainerSize={ setContainerSize }
            />
          <Panel
            ref={ panelRef }
            panelStyle={ panelStyle }
          />
        </MDBRow>
        { threeIsReady ? children : undefined }
      </ThreeJSContext.Provider>
    </>
  );

}

export default ThreeWrapper;