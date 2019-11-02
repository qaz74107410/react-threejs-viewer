import * as THREEjs from 'three';

// loader
import { AMFLoader } from 'three/examples/jsm/loaders/AMFLoader';
import { AWDLoader } from 'three/examples/jsm/loaders/AWDLoader';
// import { BabylonLoader } from 'three/examples/jsm/loaders/BabylonLoader';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { KMZLoader } from 'three/examples/jsm/loaders/KMZLoader';
// import { LegacyGLTFLoader } from 'three/examples/jsm/loaders/LegacyGLTFLoader';
import { MD2Loader } from 'three/examples/jsm/loaders/MD2Loader';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader';
import { VRMLLoader } from 'three/examples/jsm/loaders/VRMLLoader';
import { VTKLoader } from 'three/examples/jsm/loaders/VTKLoader';

// // custom loader
// import AMFLoader from './loader/AMFLoader';
// import AWDLoader from './loader/AWDLoader';
// import BabylonLoader from './loader/BabylonLoader';
// import ColladaLoader from './loader/ColladaLoader';
// import FBXLoader from './loader/FBXLoader';
// import GLTFLoader from './loader/GLTFLoader';
// import KMZLoader from './loader/KMZLoader';
// import LegacyGLTFLoader from './loader/LegacyGLTFLoader';
// import MD2Loader from './loader/MD2Loader';
// import MMDLoader from './loader/MMDLoader';
// import OBJLoader from './loader/OBJLoader';
// import PLYLoader from './loader/PLYLoader';
// import STLLoader from './loader/STLLoader';
// import SVGLoader from './loader/SVGLoader';
// import TDSLoader from './loader/TDSLoader';
// import VRMLLoader from './loader/VRMLLoader';
// import VTKLoader from './loader/VTKLoader';

const THREE = (function (THREEjs) {
	
	THREEjs.AMFLoader = AMFLoader;
	THREEjs.AWDLoader = AWDLoader;
	// THREEjs.BabylonLoader = BabylonLoader;
	THREEjs.ColladaLoader = ColladaLoader;
	THREEjs.FBXLoader = FBXLoader;
	THREEjs.GLTFLoader = GLTFLoader;
	THREEjs.KMZLoader = KMZLoader;
	// THREEjs.LegacyGLTFLoader = LegacyGLTFLoader;
	THREEjs.MD2Loader = MD2Loader;
	THREEjs.MMDLoader = MMDLoader;
	THREEjs.OBJLoader = OBJLoader;
	THREEjs.PLYLoader = PLYLoader;
	THREEjs.STLLoader = STLLoader;
	THREEjs.SVGLoader = SVGLoader;
	THREEjs.TDSLoader = TDSLoader;
	THREEjs.VRMLLoader = VRMLLoader;
	THREEjs.VTKLoader = VTKLoader;

	return THREEjs;

})(THREEjs || {});

function Loader( scene ) {

  const loadFiles = ( files, callback ) => {

    if ( files.length > 0 ) {

			// 	onst filesMap = files.reduce(( map, file ) => {
      //   map[ file.name ] = file;
      //   return map;
      // }, {});
			const filesMap = createFileMap( files );

			const manager = new THREE.LoadingManager();
			manager.setURLModifier( function ( url ) {

				const file = filesMap[ url ];

				if ( file ) {

					console.log( 'Loading', url );
					return URL.createObjectURL( file );

				}

				return url;

			} );

			for ( var i = 0; i < files.length; i ++ ) {

				loadFile( files[ i ], manager, callback );

			}

			console.log( scene );

		}

  } 

  const loadFile = ( file, manager, callback ) => {
    
    const filename = file.name;
		const extension = filename.split( '.' ).pop().toLowerCase();

		const reader = new FileReader();
		reader.addEventListener( 'progress', function ( event ) {

			let size = `(${Math.floor( event.total / 1000 )} KB)`;
			let progress = `${Math.floor( ( event.loaded / event.total ) * 100 )}%`;

			console.log( 'Loading', filename, size, progress );

		} );

		switch ( extension ) {
			
			// Object Handler

			case '3ds':

				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.TDSLoader();
					var object = loader.parse( event.target.result );

					scene.add( object );

					callback && callback();
				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'amf':

				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.AMFLoader();
					var amfobject = loader.parse( event.target.result );

					scene.add( amfobject );

					callback && callback();
				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'awd':

				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.AWDLoader();
					var loadedscene = loader.parse( event.target.result );

					// editor.execute( new SetSceneCommand( scene ) );
					loadedscene.children.forEach(obj => {
						scene.add(obj);
					});

					callback && callback();
				}, false );
				reader.readAsArrayBuffer( file );

				break;

			// case 'babylon':

			// 	reader.addEventListener( 'load', function ( event ) {

			// 		var contents = event.target.result;
			// 		var json = JSON.parse( contents );

			// 		var loader = new THREE.BabylonLoader();
			// 		var loadedscene = loader.parse( json );

			// 		// editor.execute( new SetSceneCommand( scene ) );
			// 		loadedscene.children.forEach(obj => {
			// 			scene.add(obj);
			// 		});

			// 		callback && callback();
			// 	}, false );
			// 	reader.readAsText( file );

			// 	break;

			case 'babylonmeshdata':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var json = JSON.parse( contents );

					var loader = new THREE.BabylonLoader();

					var geometry = loader.parseGeometry( json );
					var material = new THREE.MeshStandardMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					// editor.execute( new AddObjectCommand( mesh ) );
					scene.add( mesh );

					callback && callback();
				}, false );
				reader.readAsText( file );

				break;

			case 'dae':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.ColladaLoader( manager );
					var collada = loader.parse( contents );

					collada.scene.name = filename;

					// editor.addAnimation( collada.scene, collada.animations );
					// editor.execute( new AddObjectCommand( collada.scene ) );
					scene.add( collada.scene )

					callback && callback();
				}, false );
				reader.readAsText( file );

				break;

			case 'fbx':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.FBXLoader( manager );
					var object = loader.parse( contents );

					// editor.addAnimation( object, object.animations );
					// editor.execute( new AddObjectCommand( object ) );
					scene.add( object );

					callback && callback();
				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'glb':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					THREE.DRACOLoader.setDecoderPath( '../examples/js/libs/draco/gltf/' );

					var loader = new THREE.GLTFLoader();
					loader.setDRACOLoader( new THREE.DRACOLoader() );
					loader.parse( contents, '', function ( result ) {

						var scene = result.scene;
						scene.name = filename;

						// editor.addAnimation( scene, result.animations );
						// editor.execute( new AddObjectCommand( scene ) );
						scene.add( scene )

					} );

					callback && callback();
				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'gltf':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader;

					loader = new THREE.GLTFLoader( manager );

					loader.parse( contents, '', function ( result ) {

						var loadedscene = result.loadedscene;
						loadedscene.name = filename;

						// editor.addAnimation( loadedscene, result.animations );
						// editor.execute( new AddObjectCommand( loadedscene ) );
						scene.add( loadedscene );

					} );

					callback && callback();
				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'js':
			case 'json':

			case '3geo':
			case '3mat':
			case '3obj':
			case '3scn':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					// 2.0

					if ( contents.indexOf( 'postMessage' ) !== - 1 ) {

						var blob = new Blob( [ contents ], { type: 'text/javascript' } );
						var url = URL.createObjectURL( blob );

						var worker = new Worker( url );

						worker.onmessage = function ( event ) {

							event.data.metadata = { version: 2 };
							handleJSON( event.data, file, filename );

						};

						worker.postMessage( Date.now() );

						return;

					}

					// >= 3.0

					var data;

					try {

						data = JSON.parse( contents );

					} catch ( error ) {

						alert( error );
						return;

					}

					handleJSON( data, file, filename );

					callback && callback();
				}, false );
				reader.readAsText( file );

				break;


			case 'kmz':

				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.KMZLoader();
					var collada = loader.parse( event.target.result );

					collada.scene.name = filename;

					// editor.execute( new AddObjectCommand( collada.scene ) );
					scene.add( collada.scene )

					callback && callback();
				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'md2':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.MD2Loader().parse( contents );
					var material = new THREE.MeshStandardMaterial( {
						morphTargets: true,
						morphNormals: true
					} );

					var mesh = new THREE.Mesh( geometry, material );
					mesh.mixer = new THREE.AnimationMixer( mesh );
					mesh.name = filename;

					// editor.addAnimation( mesh, geometry.animations );
					// editor.execute( new AddObjectCommand( mesh ) );
					scene.add( mesh );

					callback && callback();
				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'obj':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var object = new THREE.OBJLoader().parse( contents );
					object.name = filename;

					// editor.execute( new AddObjectCommand( object ) );
					scene.add( object );

					callback && callback();
				}, false );
				reader.readAsText( file );

				break;

			case 'pmd':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.MMDLoader( manager )
					var object = loader.parsePMD( contents );

					// editor.addAnimation( object, object.animations );
					// editor.execute( new AddObjectCommand( object ) );
					scene.add( object );

					callback && callback();
				}, false );
				reader.readAsArrayBuffer( file );
				// reader.readAsBinaryString( file );
				// reader.readAsDataURL( file );

				break;

			case 'pmx':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.MMDLoader( manager )
					var object = loader.parsePMX( contents );

					// editor.addAnimation( object, object.animations );
					// editor.execute( new AddObjectCommand( object ) );
					scene.add( object );

					callback && callback();
				}, false );
				reader.readAsArrayBuffer( file );
				// reader.readAsBinaryString( file );
				// reader.readAsDataURL( file );

				break;

			// case 'playcanvas':

			// 	reader.addEventListener( 'load', function ( event ) {

			// 		var contents = event.target.result;
			// 		var json = JSON.parse( contents );

			// 		var loader = new THREE.PlayCanvasLoader();
			// 		var object = loader.parse( json );

			// 		editor.execute( new AddObjectCommand( object ) );

			callback && callback();
			// 	}, false );
			// 	reader.readAsText( file );

			// 	break;

			case 'ply':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.PLYLoader().parse( contents );
					geometry.sourceType = "ply";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshStandardMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					// editor.execute( new AddObjectCommand( mesh ) );
					scene.add( mesh );

					callback && callback();
				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'stl':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.STLLoader().parse( contents );
					geometry.sourceType = "stl";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshStandardMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					// editor.execute( new AddObjectCommand( mesh ) );
					scene.add( mesh );

					callback && callback();
				}, false );

				if ( reader.readAsBinaryString !== undefined ) {

					reader.readAsBinaryString( file );

				} else {

					reader.readAsArrayBuffer( file );

				}

				break;

			case 'svg':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.SVGLoader();
					var paths = loader.parse( contents ).paths;

					//

					var group = new THREE.Group();
					group.scale.multiplyScalar( 0.1 );
					group.scale.y *= - 1;

					for ( var i = 0; i < paths.length; i ++ ) {

						var path = paths[ i ];

						var material = new THREE.MeshBasicMaterial( {
							color: path.color,
							depthWrite: false
						} );

						var shapes = path.toShapes( true );

						for ( var j = 0; j < shapes.length; j ++ ) {

							var shape = shapes[ j ];

							var geometry = new THREE.ShapeBufferGeometry( shape );
							var mesh = new THREE.Mesh( geometry, material );

							group.add( mesh );

						}

					}

					// editor.execute( new AddObjectCommand( group ) );
					scene.add( group );

					callback && callback();
				}, false );
				reader.readAsText( file );

				break;

			case 'vtk':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.VTKLoader().parse( contents );
					geometry.sourceType = "vtk";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshStandardMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					// editor.execute( new AddObjectCommand( mesh ) );
					scene.add( mesh );

					callback && callback();
				}, false );
				reader.readAsText( file );

				break;

			case 'wrl':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var result = new THREE.VRMLLoader().parse( contents );

					// editor.execute( new SetSceneCommand( result ) );
					result.children.forEach(obj => {
						scene.add(obj);
					});

					callback && callback();
				}, false );
				reader.readAsText( file );

				break;

			case 'zip':

				// reader.addEventListener( 'load', function ( event ) {

				// 	handleZIP( event.target.result );

				callback && callback();
				// }, false );
				// reader.readAsBinaryString( file );

				break;

			// Texture Handler

			case 'png':
			case 'jpg' :
			case 'jpeg' :
			case 'gif' :

				// https://stackoverflow.com/questions/50431636/load-texture-from-user-upload-to-geometry-in-three-js
				// https://stackoverflow.com/questions/16066448/three-js-texture-image-update-at-runtime

				break;

			default:

				// alert( 'Unsupported file format (' + extension +  ').' );

				break;

		}
    
	}
	
	const createFileMap = files => {

		const map = {};

		for ( let i = 0; i < files.length; i ++ ) {

			const file = files[ i ];
			map[ file.name ] = file;

		}

		return map;

	}

  const handleJSON = ( data, file, filename ) => {

		let loader;
		let result;
		let mesh;

		if ( data.metadata === undefined ) { // 2.0

			data.metadata = { type: 'Geometry' };

		}

		if ( data.metadata.type === undefined ) { // 3.0

			data.metadata.type = 'Geometry';

		}

		if ( data.metadata.formatVersion !== undefined ) {

			data.metadata.version = data.metadata.formatVersion;

		}

		switch ( data.metadata.type.toLowerCase() ) {

			case 'buffergeometry':

				loader = new THREE.BufferGeometryLoader();
				result = loader.parse( data );

				mesh = new THREE.Mesh( result );

				editor.execute( new AddObjectCommand( mesh ) );

				break;

			case 'geometry':

        console.error( 'Loader: "Geometry" is no longer supported.' );
        // TODO : convert geometry to buffergeometry

				break;

			case 'object':

				loader = new THREE.ObjectLoader();
				loader.setResourcePath( scope.texturePath );

				result = loader.parse( data );

				if ( result.isScene ) {

					editor.execute( new SetSceneCommand( result ) );

				} else {

					editor.execute( new AddObjectCommand( result ) );

				}

				break;

			case 'app':

				editor.fromJSON( data );

				break;

		}

	}

	return {
		loadFiles,
		loadFile 
	}
}

export default Loader;