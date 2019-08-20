import React, { useEffect, useState, useContext } from 'react';
import { ThreeJSContext } from '../../threeWarpper';

function Scene() {

  const context = useContext(ThreeJSContext)
  const { scene, useSignel, signelnames } = context;

  const [objlist, setObjlist] = useState()

  const buildUIObj = (obj, level) => {
    return (<div uuid={obj.uuid} key={obj.uuid}><span>{'-'.repeat(level)}</span>{obj.type}</div>)
  }

  let jsx = []

  const getChildTree = (obj, level = 1) => {

    obj.children.forEach(childobj => {
      jsx.push( buildUIObj( childobj, level ) )
      // console.log( "-".repeat(level), childobj.type);
      if ( childobj.children !== undefined ) {
        getChildTree( childobj, level + 1 );
      }
    });

  }

  // useSignel(() => {
    
  //   jsx = []
  //   getChildTree( scene )
  //   setObjlist( jsx )
  
  // }, [signelnames.three_ready])
  
  useEffect(() => {
    if ( scene ) {
      getChildTree( scene )
      setObjlist( jsx )
    }
  }, [scene])

  return (
    <div>
      {objlist}
    </div>
  )
}

export default Scene
