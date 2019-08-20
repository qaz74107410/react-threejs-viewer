import * as THREE from 'three';
import { useEffect, useContext } from 'react';
import { ThreeJSContext } from '../threeWarpper';

const Cube = props => {
  const { h = 50, w = 50, d = 50, color = 0x00ff00 } = props;

  const context = useContext(ThreeJSContext)
  const { scene } = context;

  // setup
  useEffect(() => {
    const cubegeometry = new THREE.BoxGeometry(h, w, d);
    const cubematerial = new THREE.MeshPhongMaterial({ color });
    const cube = new THREE.Mesh(cubegeometry, cubematerial);
    cube.castShadow = true;
    cube.position.y = 150;
    const group = new THREE.Group();
    group.add(cube)
    scene.add(group);
    // console.log(scene);
  }, []);

  return null;
};

export default Cube;