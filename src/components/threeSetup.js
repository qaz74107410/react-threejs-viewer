import * as THREEjs from 'three';
import OrbitControls from 'three-orbitcontrols';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

const THREE = (function(THREEjs) {

  THREEjs.TransformControls = TransformControls;

  return THREEjs;

})(THREEjs || {});

export const getCamera = ({ offsetWidth, offsetHeight }) => {
  const camera = new THREE.PerspectiveCamera(
    45,
    offsetWidth / offsetHeight,
    1,
    // 1000,
    100000,
  );
  camera.position.set(50, 150, 0);

  return camera;
};

export const getRenderer = canvas => {
  const context = canvas.getContext('webgl') || canvas.getContext("experimental-webgl");
  if ( !context ) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
  const renderer = new THREE.WebGLRenderer({
    canvas,
    context,
  });

  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  return renderer;
};

export const getScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf9f9f9);
  // scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

  const light = new THREE.SpotLight(0xffffff, 1, 750, 1);
  light.position.set(50, 200, 0);
  light.rotation.z = (90 * Math.PI) / 180;
  scene.add(light);

  const planeGeometry = new THREE.PlaneBufferGeometry(10000, 10000, 32, 32);
  const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  plane.rotation.x = (-90 * Math.PI) / 180;
  plane.receiveShadow = true;
  scene.add(plane);

  return scene;
};

export const getControl = (camera, canvas) => {
  const orbit = new OrbitControls( camera, canvas );
  orbit.update();
  return orbit;
}

// export const getCanvas = container => {
//   const canvas = document. createElement("CANVAS");
//   document.container.appendChild(canvas);

//   return canvas;
// }

export const getCanvas = canvasRef => {
  return canvasRef.current;
}

export const getTransformControls = (camera, canvas) => {
  const control = new THREE.TransformControls( camera, canvas );
  return control;
}