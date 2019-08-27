/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * 
 * @rewrite komsan
 */
  
const BabylonLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

BabylonLoader.prototype = {

	constructor: BabylonLoader,

	load(url, onLoad, onProgress, onError) {

		const scope = this;

		const loader = new THREE.FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.load( url, text => {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

	},

	setPath(value) {

		this.path = value;
		return this;

	},

	parse(json) {

		function parseMaterials( json ) {

			const materials = {};

			for ( var i = 0, l = json.materials.length; i < l; i ++ ) {

				var data = json.materials[ i ];

				const material = new THREE.MeshPhongMaterial();
				material.name = data.name;
				material.color.fromArray( data.diffuse );
				material.emissive.fromArray( data.emissive );
				material.specular.fromArray( data.specular );
				material.shininess = data.specularPower;
				material.opacity = data.alpha;

				materials[ data.id ] = material;

			}

			if ( json.multiMaterials ) {

				for ( var i = 0, l = json.multiMaterials.length; i < l; i ++ ) {

					var data = json.multiMaterials[ i ];

					console.warn( 'BabylonLoader: Multi materials not yet supported.' );

					materials[ data.id ] = new THREE.MeshPhongMaterial();

				}

			}

			return materials;

		}

		function parseGeometry( json ) {

			const geometry = new THREE.BufferGeometry();

			const indices = json.indices;
			const positions = json.positions;
			const normals = json.normals;
			const uvs = json.uvs;

			// indices

			geometry.setIndex( indices );

			// positions

			for ( var j = 2, jl = positions.length; j < jl; j += 3 ) {

				positions[ j ] = - positions[ j ];

			}

			geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );

			// normals

			if ( normals ) {

				for ( var j = 2, jl = normals.length; j < jl; j += 3 ) {

					normals[ j ] = - normals[ j ];

				}

				geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );

			}

			// uvs

			if ( uvs ) {

				geometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

			}

			// offsets

			const subMeshes = json.subMeshes;

			if ( subMeshes ) {

				for ( var j = 0, jl = subMeshes.length; j < jl; j ++ ) {

					const subMesh = subMeshes[ j ];

					geometry.addGroup( subMesh.indexStart, subMesh.indexCount );

				}

			}

			return geometry;

		}

		function parseObjects( json, materials ) {

			const objects = {};
			const scene = new THREE.Scene();

			const cameras = json.cameras;

			for ( var i = 0, l = cameras.length; i < l; i ++ ) {

				var data = cameras[ i ];

				const camera = new THREE.PerspectiveCamera( ( data.fov / Math.PI ) * 180, 1.33, data.minZ, data.maxZ );

				camera.name = data.name;
				camera.position.fromArray( data.position );
				if ( data.rotation ) camera.rotation.fromArray( data.rotation );

				objects[ data.id ] = camera;

			}

			const lights = json.lights;

			for ( var i = 0, l = lights.length; i < l; i ++ ) {

				var data = lights[ i ];

				let light;

				switch ( data.type ) {

					case 0:
						light = new THREE.PointLight();
						break;

					case 1:
						light = new THREE.DirectionalLight();
						break;

					case 2:
						light = new THREE.SpotLight();
						break;

					case 3:
						light = new THREE.HemisphereLight();
						break;

				}

				light.name = data.name;
				if ( data.position ) light.position.set( data.position[ 0 ], data.position[ 1 ], - data.position[ 2 ] );
				light.color.fromArray( data.diffuse );
				if ( data.groundColor ) light.groundColor.fromArray( data.groundColor );
				if ( data.intensity ) light.intensity = data.intensity;

				objects[ data.id ] = light;

				scene.add( light );

			}

			const meshes = json.meshes;

			for ( var i = 0, l = meshes.length; i < l; i ++ ) {

				var data = meshes[ i ];

				let object;

				if ( data.indices ) {

					const geometry = parseGeometry( data );

					object = new THREE.Mesh( geometry, materials[ data.materialId ] );

				} else {

					object = new THREE.Group();

				}

				object.name = data.name;
				object.position.set( data.position[ 0 ], data.position[ 1 ], - data.position[ 2 ] );
				object.rotation.fromArray( data.rotation );
				if ( data.rotationQuaternion ) object.quaternion.fromArray( data.rotationQuaternion );
				object.scale.fromArray( data.scaling );
				// object.visible = data.isVisible;

				if ( data.parentId ) {

					objects[ data.parentId ].add( object );

				} else {

					scene.add( object );

				}

				objects[ data.id ] = object;

			}

			return scene;

		}

		const materials = parseMaterials( json );
		const scene = parseObjects( json, materials );

		return scene;

	}

};

export default BabylonLoader;