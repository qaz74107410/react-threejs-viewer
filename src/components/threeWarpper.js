import React, { useReducer, useState, createContext, useRef, useEffect, useLayoutEffect } from 'react';
import { MDBRow } from 'mdbreact';

import Workarea from './workarea';
import Headers from "./header";
import Panel from "./panel";

import createSignel from './use/useSignel';

import * as THREE from 'three';
import { getTransformControls, getGridHelper, getRaycaster, getSpotLightHelper } from './threeSetup';
import { useSetting } from './use/useSetting';

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

  // Setting
  const [ settings, setSettings ] = useSetting();

  // Signel to do something in other component
  const signelnames = [
    "menu_new",
    "menu_import",
    "three_ready",
    "three_forceupdate"
  ];
  const signel = createSignel( signelnames );  

  // State
  const [threeIsReady, setThreeIsReady] = useState(false);
  const [timer, updateTimer] = useState(0);
  const [animateFn, setAnimateFn] = useState([]);
  const [selectedObj, setSelectedObj] = useState({});
  
  // Reference 
  const canvasRef = useRef({});
  const sceneRef = useRef();
  const cameraRef = useRef();
  const orbitRef = useRef();
  const rendererRef = useRef();
  const headerRef = useRef();
  const panelRef = useRef();
  const controlRef = useRef();
  const gridHelperRef = useRef();
  const raycasterRef = useRef();
  const spotlightHelperRef = useRef();
  const mouseRef = useRef(new THREE.Vector2());
  
  // Style state
  const [headerStyle, setHeaderStyle] = useState({ height: headerHeight });
  const [panelStyle, setPanelStyle] = useState({ height: document.body.clientHeight - headerStyle.height, width: panelWidth, maxHeight: document.body.clientHeight - headerStyle.height });
  const [containerStyle, setContainerStyle] = useState({ height: document.body.clientHeight - headerStyle.height, width: document.body.clientWidth - panelWidth });
  const [canvasStyle, setCanvasStyle] = useState({ height: window.innerHeight - headerStyle.height, width: window.outerWidth });
  
  // Event
  const onWindowResize = () => {
    cameraRef.current.aspect = canvasRef.current.offsetWidth / canvasRef.current.offsetHeight;
    cameraRef.current.updateProjectionMatrix();

    rendererRef.current.setSize( canvasRef.current.offsetWidth, canvasRef.current.offsetHeight );
  };

  const onDraggingChanged = e => {
    orbitRef.current.enabled = ! e.value;
  }

  const onMouseMove = e => {
    // mouseRef.current.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	  // mouseRef.current.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    mouseRef.current.x = ( event.clientX / canvasStyle.width ) * 2 - 1;
	  mouseRef.current.y = - ( event.clientY / canvasStyle.height ) * 2 + 1;
  }

  const onMouseUp = e => {
    signel.sendSignel( signel.names.three_forceupdate );
    // findIntersects(mouseRef.current, cameraRef.current)
  }

  const onKeyPress = e => {
    const key = e.key
    
    switch (key) {
      case settings.key_translate :
        controlRef.current.setMode("translate")
        break;
      case settings.key_rotate :
        controlRef.current.setMode("rotate")
        break;
      case settings.key_scale :
        controlRef.current.setMode("scale")
        break;
      // case settings.key_deselect :
      //   selectObj( undefined )
      //   useSignel(signelnames.three_forceupdate)
      //   break;
      default:
        console.log('nokey')
        break;
      }
    console.log(key)
  }

  const setContainerSize = () => {
    setContainerStyle({ height: window.innerHeight - headerStyle.height, width: window.innerWidth - panelWidth });
  }
  
  // command functions  
  const selectObj = obj => {
    setSelectedObj( obj );
    let invisgroup
    if ( !obj || !obj.isObject3D ) {
      // deselect
      controlRef.current.visible = false;
      return;
    }
    // attach controller to object
    controlRef.current.visible = true;
    if ( controlRef.current !== obj && !obj.isScene ) {
      controlRef.current.attach( obj );
    }
    // create attach spotlighthelper
    if ( obj.isSpotLight ) {
      invisgroup = sceneRef.current.getObjectByName('invisible')
      if ( spotlightHelperRef.current && spotlightHelperRef.current.light.uuid !== obj.uuid ) {
        spotlightHelperRef.current.parent.remove( spotlightHelperRef.current );
        spotlightHelperRef.current.dispose();
        spotlightHelperRef.current = undefined
      } 
      if ( !spotlightHelperRef.current ) {
        spotlightHelperRef.current = getSpotLightHelper( obj );
        invisgroup.add( spotlightHelperRef.current ); 
      }
    } else if ( spotlightHelperRef.current ) {
      spotlightHelperRef.current.parent.remove( spotlightHelperRef.current );
      spotlightHelperRef.current.dispose();
      spotlightHelperRef.current = undefined
    }
    console.log("select : ", obj);
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
    gridHelper: gridHelperRef.current,

    selectedObj : selectedObj,
    selectObj : selectObj,

    useSignel: signel.useSignel,
    sendSignel: signel.sendSignel,
    signelnames: signel.names,

    settings,
    setSettings,
    
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
    gridHelperRef.current = getGridHelper();
    raycasterRef.current = getRaycaster();

    const invisgroup = sceneRef.current.getObjectByName('invisible')
    invisgroup.add( controlRef.current );
    controlRef.current.attach( sceneRef.current.children[0] ) ;
    
    invisgroup.add( gridHelperRef.current );

    // sceneRef.current.add( controlRef.current );
    // controlRef.current.attach( sceneRef.current.children[0] );
    // console.log( sceneRef.current.children[0] );

    // console.log( sceneRef.current );

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

    // update helper
    if ( spotlightHelperRef.current !== undefined ) {
      spotlightHelperRef.current.update();
    }

    // findIntersects(mouseRef.current, cameraRef.current);
  }

  // signel ready
  useEffect(() => {
    if ( threeIsReady === true ) {
      animate();
      signel.sendSignel( signel.names.three_ready );

      // resize event
      window.addEventListener( 'resize', onWindowResize );
      canvasRef.current.addEventListener( 'mousemove', onMouseMove, false );
      canvasRef.current.addEventListener( 'mouseup', onMouseUp, false );
      canvasRef.current.addEventListener( 'touchend', onMouseUp, false );
      
      controlRef.current.addEventListener( 'dragging-changed', onDraggingChanged );
      return () => {
        window.removeEventListener( 'resize', onWindowResize );
        canvasRef.current.removeEventListener( 'mousemove', onMouseMove );
        canvasRef.current.addEventListener( 'mouseup', onMouseUp );
        canvasRef.current.addEventListener( 'touchend', onMouseUp );

        controlRef.current.removeEventListener( 'dragging-changed', onDraggingChanged );
      };
      
    }
  }, [threeIsReady])

  // raycaster
  // disable due no idea which nested object user want to select ?
  const findIntersects = (mouse, camera) => {
    const raycaster = raycasterRef.current;
    raycaster.setFromCamera( mouse, camera );

    
    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects( sceneRef.current.children, true );
    
    if ( intersects.length > 0 ) {
      
      // intersects[ 0 ].object.material.color.set( 0xff0000 );
      // intersects.forEach(isect => {
      //   if ( isect.object.parent.name !== 'invisible' ) {
      //     console.log( intersects.map( isect => {return isect.object} ));
      //     isect.object.material.color.set( 0xff0000 );
      //   }
      // });
      if ( intersects[0].isScene || intersects[0].name === settings.invisname ) {
        controlRef.current.visible = false
      }

      // console.log(intersects);

    }

  }


  return (
    <>
      <ThreeJSContext.Provider value={ threeContext }>
        <Headers
          headerStyle={ headerStyle }
        />
        <MDBRow>
          <Workarea 
            ref={ canvasRef }
            canvasStyle={ canvasStyle }
            containerStyle={ containerStyle }
            setContainerSize={ setContainerSize }
            onKeyPress = { onKeyPress }
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