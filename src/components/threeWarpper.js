import React, { useReducer, useState, createContext, useRef, useEffect, useLayoutEffect } from 'react';
import { MDBRow } from 'mdbreact';

import Workarea from './workarea';
import Headers from "./header";
import Panel from "./panel";

import createSignel from './useSignel';

import Loader from './three/loader';
import { getTransformControls } from './threeSetup';

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

  // Signel to do something in other component
  const signelnames = [
    "menu_new",
    "menu_import",
    "three_ready"
  ];
  const signel = createSignel( signelnames );

  // Menu function call
  

  // State
  const [threeIsReady, setThreeIsReady] = useState(false);
  const [timer, updateTimer] = useState(0);
  const [animateFn, setAnimateFn] = useState([]);
  const [selectedObj, setSelectedObj] = useState();
  
  // Reference 
  const canvasRef = useRef({});
  const sceneRef = useRef();
  const cameraRef = useRef();
  const orbitRef = useRef();
  const rendererRef = useRef();
  const headerRef = useRef();
  const panelRef = useRef();
  const controlRef = useRef();
  
  // Style state
  const [headerStyle, setHeaderStyle] = useState({ height: headerHeight });
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

    orbit: orbitRef.current,
    header: headerRef.current,
    panel: panelRef.current,
    control: controlRef.current,

    selectedObj : selectedObj,
    setSelectedObj : setSelectedObj,

    useSignel: signel.useSignel,
    sendSignel: signel.sendSignel,
    signelnames: signel.names,
    
    setAnimateFn,
    timer,
  };

  // setup scene, camera, and renderer, and store references
  useEffect(() => {
    const canvas = canvasRef.current;
    sceneRef.current = getScene();
    rendererRef.current = getRenderer(canvas);
    cameraRef.current = getCamera(canvas);
    orbitRef.current = getControl(cameraRef.current, canvas);
    controlRef.current = getTransformControls(cameraRef.current, canvas);

    sceneRef.current.add( controlRef.current );
    controlRef.current.attach( sceneRef.current.children[0] );
    // controlRef.current.attach( sceneRef.current.children[0] );
    console.log( sceneRef.current.children[0] );

    console.log( sceneRef.current );

    setThreeIsReady(true);
    return () => {
      setThreeIsReady(false)
    }
  }, []);

  // update camera and renderer when dimensions change
  useLayoutEffect(
    () => {
      try {
        cameraRef.current.aspect = offsetWidth / offsetHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(offsetWidth, offsetHeight);
        
      } catch (error) {
        
      }
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
    if ( threeIsReady ) {
      animateFn.forEach(fn => {
        fn();
      });
      render();
      window.requestAnimationFrame(animate);
      // console.log('animate 😃');
    }
  }
  const render = () => {  
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }

  // signel ready
  useEffect(() => {
    if ( threeIsReady === true ) {
      animate();
      signel.sendSignel( signel.names.three_ready );
    }
  }, [threeIsReady])

  // raycaster


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
          { threeIsReady ? children : undefined }
          <Panel
            ref={ panelRef }
            panelStyle={ panelStyle }
            />
        </MDBRow>
      </ThreeJSContext.Provider>
    </>
  );

}

export default ThreeWrapper;