import React, { forwardRef, useEffect, useRef, useContext } from 'react';
import * as THREE from 'three';

import { ThreeJSContext } from './threeWarpper';

const Workarea = ({ canvasStyle, containerStyle, setContainerSize }, canvasRef) => {

  const containerRef = useRef();

  const onWindowResize = () => {
    setContainerSize();
    fitToContainer(canvasRef.current);
    console.log("resize 🔥")
  };

  useEffect(() => {
    window.addEventListener('resize', onWindowResize);
    onWindowResize();
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  const fitToContainer = (canvas) => {
    // Make it visually fill the positioned parent
    canvas.style.width ='100%';
    canvas.style.height='100%';
    canvas.style.width = containerRef.current.offsetWidth+'px';
    canvas.style.height= containerRef.current.offsetHeight+'px';
    // ...then set the internal size to match
    canvas.width  = containerRef.current.offsetWidth;
    canvas.height = containerRef.current.offsetHeight;
  }

  return (
    <div className="render-container" ref={containerRef} style={ containerStyle }>
      {/* render me :D */}
      <canvas ref={canvasRef}/>
    </div>
  )

}

export default forwardRef(Workarea);