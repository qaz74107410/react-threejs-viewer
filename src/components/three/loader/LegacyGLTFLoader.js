/**
 * @author Rich Tibbett / https://github.com/richtr
 * @author mrdoob / http://mrdoob.com/
 * @author Tony Parisi / http://www.tonyparisi.com/
 * @author Takahiro / https://github.com/takahirox
 * @rewrite komsan
 */

import * as THREE from 'three';

const LegacyGLTFLoader = (() => {
    function LegacyGLTFLoader( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	}

    LegacyGLTFLoader.prototype = {

		constructor: LegacyGLTFLoader,

		crossOrigin: 'anonymous',

		load(url, onLoad, onProgress, onError) {

			const scope = this;

			let resourcePath;

			if ( this.resourcePath !== undefined ) {

				resourcePath = this.resourcePath;

			} else if ( this.path !== undefined ) {

				resourcePath = this.path;

			} else {

				resourcePath = THREE.LoaderUtils.extractUrlBase( url );

			}

			const loader = new THREE.FileLoader( scope.manager );

			loader.setPath( this.path );
			loader.setResponseType( 'arraybuffer' );

			loader.load( url, data => {

				scope.parse( data, resourcePath, onLoad );

			}, onProgress, onError );

		},

		setCrossOrigin(value) {

			this.crossOrigin = value;
			return this;

		},

		setPath(value) {

			this.path = value;

		},

		setResourcePath(value) {

			this.resourcePath = value;
			return this;

		},

		parse(data, path, callback) {

			let content;
			const extensions = {};

			const magic = THREE.LoaderUtils.decodeText( new Uint8Array( data, 0, 4 ) );

			if ( magic === BINARY_EXTENSION_HEADER_DEFAULTS.magic ) {

				extensions[ EXTENSIONS.KHR_BINARY_GLTF ] = new GLTFBinaryExtension( data );
				content = extensions[ EXTENSIONS.KHR_BINARY_GLTF ].content;

			} else {

				content = THREE.LoaderUtils.decodeText( new Uint8Array( data ) );

			}

			const json = JSON.parse( content );

			if ( json.extensionsUsed && json.extensionsUsed.includes(EXTENSIONS.KHR_MATERIALS_COMMON) ) {

				extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ] = new GLTFMaterialsCommonExtension( json );

			}

			const parser = new GLTFParser( json, extensions, {

				crossOrigin: this.crossOrigin,
				manager: this.manager,
				path: path || this.resourcePath || ''

			} );

			parser.parse( (scene, scenes, cameras, animations) => {

				const glTF = {
					"scene": scene,
					"scenes": scenes,
					"cameras": cameras,
					"animations": animations
				};

				callback( glTF );

			} );

		}

	};

    /* GLTFREGISTRY */

    function GLTFRegistry() {

		let objects = {};

		return {

			get(key) {

				return objects[ key ];

			},

			add(key, object) {

				objects[ key ] = object;

			},

			remove(key) {

				delete objects[ key ];

			},

			removeAll() {

				objects = {};

			},

			update(scene, camera) {

				for ( const name in objects ) {

					const object = objects[ name ];

					if ( object.update ) {

						object.update( scene, camera );

					}

				}

			}

		};

	}

    /* GLTFSHADERS */

    LegacyGLTFLoader.Shaders = {

		update() {

			console.warn( 'LegacyGLTFLoader.Shaders has been deprecated, and now updates automatically.' );

		}

	};

    /* GLTFSHADER */

    class GLTFShader {
        constructor(targetNode, allNodes) {

            const boundUniforms = {};

            // bind each uniform to its source node

            const uniforms = targetNode.material.uniforms;

            for ( const uniformId in uniforms ) {

                const uniform = uniforms[ uniformId ];

                if ( uniform.semantic ) {

                    const sourceNodeRef = uniform.node;

                    let sourceNode = targetNode;

                    if ( sourceNodeRef ) {

                        sourceNode = allNodes[ sourceNodeRef ];

                    }

                    boundUniforms[ uniformId ] = {
                        semantic: uniform.semantic,
                        sourceNode,
                        targetNode,
                        uniform
                    };

                }

            }

            this.boundUniforms = boundUniforms;
            this._m4 = new THREE.Matrix4();

        }

        // Update - update all the uniform values
        update(scene, {matrixWorldInverse, projectionMatrix}) {

            const boundUniforms = this.boundUniforms;

            for ( const name in boundUniforms ) {

                const boundUniform = boundUniforms[ name ];

                switch ( boundUniform.semantic ) {

                    case "MODELVIEW":

                        var m4 = boundUniform.uniform.value;
                        m4.multiplyMatrices( matrixWorldInverse, boundUniform.sourceNode.matrixWorld );
                        break;

                    case "MODELVIEWINVERSETRANSPOSE":

                        const m3 = boundUniform.uniform.value;
                        this._m4.multiplyMatrices( matrixWorldInverse, boundUniform.sourceNode.matrixWorld );
                        m3.getNormalMatrix( this._m4 );
                        break;

                    case "PROJECTION":

                        var m4 = boundUniform.uniform.value;
                        m4.copy( projectionMatrix );
                        break;

                    case "JOINTMATRIX":

                        const m4v = boundUniform.uniform.value;

                        for ( let mi = 0; mi < m4v.length; mi ++ ) {

                            // So it goes like this:
                            // SkinnedMesh world matrix is already baked into MODELVIEW;
                            // transform joints to local space,
                            // then transform using joint's inverse
                            m4v[ mi ]
                                .getInverse( boundUniform.sourceNode.matrixWorld )
                                .multiply( boundUniform.targetNode.skeleton.bones[ mi ].matrixWorld )
                                .multiply( boundUniform.targetNode.skeleton.boneInverses[ mi ] )
                                .multiply( boundUniform.targetNode.bindMatrix );

                        }

                        break;

                    default :

                        console.warn( `Unhandled shader semantic: ${boundUniform.semantic}` );
                        break;

                }

            }

        }
    }


    /* ANIMATION */

    LegacyGLTFLoader.Animations = {

		update() {

			console.warn( 'LegacyGLTFLoader.Animation has been deprecated. Use THREE.AnimationMixer instead.' );

		}

	};

    /*********************************/
    /********** EXTENSIONS ***********/
    /*********************************/

    var EXTENSIONS = {
		KHR_BINARY_GLTF: 'KHR_binary_glTF',
		KHR_MATERIALS_COMMON: 'KHR_materials_common'
	};

    /* MATERIALS COMMON EXTENSION */

    function GLTFMaterialsCommonExtension({extensions}) {

		this.name = EXTENSIONS.KHR_MATERIALS_COMMON;

		this.lights = {};

		const extension = ( extensions && extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ] ) || {};
		const lights = extension.lights || {};

		for ( const lightId in lights ) {

			const light = lights[ lightId ];
			let lightNode;

			const lightParams = light[ light.type ];
			const color = new THREE.Color().fromArray( lightParams.color );

			switch ( light.type ) {

				case "directional":
					lightNode = new THREE.DirectionalLight( color );
					lightNode.position.set( 0, 0, 1 );
					break;

				case "point":
					lightNode = new THREE.PointLight( color );
					break;

				case "spot":
					lightNode = new THREE.SpotLight( color );
					lightNode.position.set( 0, 0, 1 );
					break;

				case "ambient":
					lightNode = new THREE.AmbientLight( color );
					break;

			}

			if ( lightNode ) {

				this.lights[ lightId ] = lightNode;

			}

		}

	}

    /* BINARY EXTENSION */

    const BINARY_EXTENSION_BUFFER_NAME = 'binary_glTF';

    var BINARY_EXTENSION_HEADER_DEFAULTS = { magic: 'glTF', version: 1, contentFormat: 0 };

    const BINARY_EXTENSION_HEADER_LENGTH = 20;

    class GLTFBinaryExtension {
        constructor(data) {

            this.name = EXTENSIONS.KHR_BINARY_GLTF;

            const headerView = new DataView( data, 0, BINARY_EXTENSION_HEADER_LENGTH );

            const header = {
                magic: THREE.LoaderUtils.decodeText( new Uint8Array( data.slice( 0, 4 ) ) ),
                version: headerView.getUint32( 4, true ),
                length: headerView.getUint32( 8, true ),
                contentLength: headerView.getUint32( 12, true ),
                contentFormat: headerView.getUint32( 16, true )
            };

            for ( const key in BINARY_EXTENSION_HEADER_DEFAULTS ) {

                const value = BINARY_EXTENSION_HEADER_DEFAULTS[ key ];

                if ( header[ key ] !== value ) {

                    throw new Error( 'Unsupported glTF-Binary header: Expected "%s" to be "%s".', key, value );

                }

            }

            const contentArray = new Uint8Array( data, BINARY_EXTENSION_HEADER_LENGTH, header.contentLength );

            this.header = header;
            this.content = THREE.LoaderUtils.decodeText( contentArray );
            this.body = data.slice( BINARY_EXTENSION_HEADER_LENGTH + header.contentLength, header.length );

        }

        loadShader({extensions}, bufferViews) {

            const bufferView = bufferViews[ extensions[ EXTENSIONS.KHR_BINARY_GLTF ].bufferView ];
            const array = new Uint8Array( bufferView );

            return THREE.LoaderUtils.decodeText( array );

        }
    }

    /*********************************/
    /********** INTERNALS ************/
    /*********************************/

    /* CONSTANTS */

    const WEBGL_CONSTANTS = {
		FLOAT: 5126,
		//FLOAT_MAT2: 35674,
		FLOAT_MAT3: 35675,
		FLOAT_MAT4: 35676,
		FLOAT_VEC2: 35664,
		FLOAT_VEC3: 35665,
		FLOAT_VEC4: 35666,
		LINEAR: 9729,
		REPEAT: 10497,
		SAMPLER_2D: 35678,
		TRIANGLES: 4,
		LINES: 1,
		UNSIGNED_BYTE: 5121,
		UNSIGNED_SHORT: 5123,

		VERTEX_SHADER: 35633,
		FRAGMENT_SHADER: 35632
	};

    const WEBGL_TYPE = {
		5126: Number,
		//35674: THREE.Matrix2,
		35675: THREE.Matrix3,
		35676: THREE.Matrix4,
		35664: THREE.Vector2,
		35665: THREE.Vector3,
		35666: THREE.Vector4,
		35678: THREE.Texture
	};

    const WEBGL_COMPONENT_TYPES = {
		5120: Int8Array,
		5121: Uint8Array,
		5122: Int16Array,
		5123: Uint16Array,
		5125: Uint32Array,
		5126: Float32Array
	};

    const WEBGL_FILTERS = {
		9728: THREE.NearestFilter,
		9729: THREE.LinearFilter,
		9984: THREE.NearestMipMapNearestFilter,
		9985: THREE.LinearMipMapNearestFilter,
		9986: THREE.NearestMipMapLinearFilter,
		9987: THREE.LinearMipMapLinearFilter
	};

    const WEBGL_WRAPPINGS = {
		33071: THREE.ClampToEdgeWrapping,
		33648: THREE.MirroredRepeatWrapping,
		10497: THREE.RepeatWrapping
	};

    const WEBGL_TEXTURE_FORMATS = {
		6406: THREE.AlphaFormat,
		6407: THREE.RGBFormat,
		6408: THREE.RGBAFormat,
		6409: THREE.LuminanceFormat,
		6410: THREE.LuminanceAlphaFormat
	};

    const WEBGL_TEXTURE_DATATYPES = {
		5121: THREE.UnsignedByteType,
		32819: THREE.UnsignedShort4444Type,
		32820: THREE.UnsignedShort5551Type,
		33635: THREE.UnsignedShort565Type
	};

    const WEBGL_SIDES = {
		1028: THREE.BackSide, // Culling front
		1029: THREE.FrontSide // Culling back
		//1032: THREE.NoSide   // Culling front and back, what to do?
	};

    const WEBGL_DEPTH_FUNCS = {
		512: THREE.NeverDepth,
		513: THREE.LessDepth,
		514: THREE.EqualDepth,
		515: THREE.LessEqualDepth,
		516: THREE.GreaterEqualDepth,
		517: THREE.NotEqualDepth,
		518: THREE.GreaterEqualDepth,
		519: THREE.AlwaysDepth
	};

    const WEBGL_BLEND_EQUATIONS = {
		32774: THREE.AddEquation,
		32778: THREE.SubtractEquation,
		32779: THREE.ReverseSubtractEquation
	};

    const WEBGL_BLEND_FUNCS = {
		0: THREE.ZeroFactor,
		1: THREE.OneFactor,
		768: THREE.SrcColorFactor,
		769: THREE.OneMinusSrcColorFactor,
		770: THREE.SrcAlphaFactor,
		771: THREE.OneMinusSrcAlphaFactor,
		772: THREE.DstAlphaFactor,
		773: THREE.OneMinusDstAlphaFactor,
		774: THREE.DstColorFactor,
		775: THREE.OneMinusDstColorFactor,
		776: THREE.SrcAlphaSaturateFactor
		// The followings are not supported by Three.js yet
		//32769: CONSTANT_COLOR,
		//32770: ONE_MINUS_CONSTANT_COLOR,
		//32771: CONSTANT_ALPHA,
		//32772: ONE_MINUS_CONSTANT_COLOR
	};

    const WEBGL_TYPE_SIZES = {
		'SCALAR': 1,
		'VEC2': 2,
		'VEC3': 3,
		'VEC4': 4,
		'MAT2': 4,
		'MAT3': 9,
		'MAT4': 16
	};

    const PATH_PROPERTIES = {
		scale: 'scale',
		translation: 'position',
		rotation: 'quaternion'
	};

    const INTERPOLATION = {
		LINEAR: THREE.InterpolateLinear,
		STEP: THREE.InterpolateDiscrete
	};

    const STATES_ENABLES = {
		2884: 'CULL_FACE',
		2929: 'DEPTH_TEST',
		3042: 'BLEND',
		3089: 'SCISSOR_TEST',
		32823: 'POLYGON_OFFSET_FILL',
		32926: 'SAMPLE_ALPHA_TO_COVERAGE'
	};

    /* UTILITY FUNCTIONS */

    function _each( object, callback, thisObj ) {

		if ( ! object ) {

			return Promise.resolve();

		}

		let results;
		const fns = [];

		if ( Object.prototype.toString.call( object ) === '[object Array]' ) {

			results = [];

			const length = object.length;

			for ( let idx = 0; idx < length; idx ++ ) {

				var value = callback.call( thisObj || this, object[ idx ], idx );

				if ( value ) {

					fns.push( value );

					if ( value instanceof Promise ) {

						value.then( (key, value) => {

							results[ key ] = value;

						} );

					} else {

						results[ idx ] = value;

					}

				}

			}

		} else {

			results = {};

			for ( const key in object ) {

				if ( object.hasOwnProperty( key ) ) {

					var value = callback.call( thisObj || this, object[ key ], key );

					if ( value ) {

						fns.push( value );

						if ( value instanceof Promise ) {

							value.then( (key, value) => {

								results[ key ] = value;

							} );

						} else {

							results[ key ] = value;

						}

					}

				}

			}

		}

		return Promise.all( fns ).then( () => {

			return results;

		} );

	}

    function resolveURL( url, path ) {

		// Invalid URL
		if ( typeof url !== 'string' || url === '' )
			return '';

		// Absolute URL http://,https://,//
		if ( /^(https?:)?\/\//i.test( url ) ) {

			return url;

		}

		// Data URI
		if ( /^data:.*,.*$/i.test( url ) ) {

			return url;

		}

		// Blob URL
		if ( /^blob:.*$/i.test( url ) ) {

			return url;

		}

		// Relative URL
		return ( path || '' ) + url;

	}

    // Three.js seems too dependent on attribute names so globally
    // replace those in the shader code
    function replaceTHREEShaderAttributes( shaderText, technique ) {

		// Expected technique attributes
		const attributes = {};

		for ( var attributeId in technique.attributes ) {

			var pname = technique.attributes[ attributeId ];

			var param = technique.parameters[ pname ];
			const atype = param.type;
			var semantic = param.semantic;

			attributes[ attributeId ] = {
				type: atype,
				semantic
			};

		}

		// Figure out which attributes to change in technique

		const shaderParams = technique.parameters;
		const shaderAttributes = technique.attributes;
		const params = {};

		for ( var attributeId in attributes ) {

			var pname = shaderAttributes[ attributeId ];
			const shaderParam = shaderParams[ pname ];
			var semantic = shaderParam.semantic;
			if ( semantic ) {

				params[ attributeId ] = shaderParam;

			}

		}

		for ( var pname in params ) {

			var param = params[ pname ];
			var semantic = param.semantic;

			const regEx = new RegExp( `\\b${pname}\\b`, "g" );

			switch ( semantic ) {

				case "POSITION":

					shaderText = shaderText.replace( regEx, 'position' );
					break;

				case "NORMAL":

					shaderText = shaderText.replace( regEx, 'normal' );
					break;

				case 'TEXCOORD_0':
				case 'TEXCOORD0':
				case 'TEXCOORD':

					shaderText = shaderText.replace( regEx, 'uv' );
					break;

				case 'TEXCOORD_1':

					shaderText = shaderText.replace( regEx, 'uv2' );
					break;

				case 'COLOR_0':
				case 'COLOR0':
				case 'COLOR':

					shaderText = shaderText.replace( regEx, 'color' );
					break;

				case "WEIGHT":

					shaderText = shaderText.replace( regEx, 'skinWeight' );
					break;

				case "JOINT":

					shaderText = shaderText.replace( regEx, 'skinIndex' );
					break;

			}

		}

		return shaderText;

	}

    function createDefaultMaterial() {

		return new THREE.MeshPhongMaterial( {
			color: 0x00000,
			emissive: 0x888888,
			specular: 0x000000,
			shininess: 0,
			transparent: false,
			depthTest: true,
			side: THREE.FrontSide
		} );

	}

    // Deferred constructor for RawShaderMaterial types
    class DeferredShaderMaterial {
        constructor(params) {

            this.isDeferredShaderMaterial = true;

            this.params = params;

        }

        create() {

            const uniforms = THREE.UniformsUtils.clone( this.params.uniforms );

            for ( const uniformId in this.params.uniforms ) {

                const originalUniform = this.params.uniforms[ uniformId ];

                if ( originalUniform.value instanceof THREE.Texture ) {

                    uniforms[ uniformId ].value = originalUniform.value;
                    uniforms[ uniformId ].value.needsUpdate = true;

                }

                uniforms[ uniformId ].semantic = originalUniform.semantic;
                uniforms[ uniformId ].node = originalUniform.node;

            }

            this.params.uniforms = uniforms;

            return new THREE.RawShaderMaterial( this.params );

        }
    }

    /* GLTF PARSER */

    class GLTFParser {
        constructor(json, extensions, options) {

            this.json = json || {};
            this.extensions = extensions || {};
            this.options = options || {};

            // loader object cache
            this.cache = new GLTFRegistry();

        }

        _withDependencies(dependencies) {

            const _dependencies = {};

            for ( let i = 0; i < dependencies.length; i ++ ) {

                const dependency = dependencies[ i ];
                const fnName = `load${dependency.charAt( 0 ).toUpperCase()}${dependency.slice( 1 )}`;

                const cached = this.cache.get( dependency );

                if ( cached !== undefined ) {

                    _dependencies[ dependency ] = cached;

                } else if ( this[ fnName ] ) {

                    const fn = this[ fnName ]();
                    this.cache.add( dependency, fn );

                    _dependencies[ dependency ] = fn;

                }

            }

            return _each( _dependencies, dependency => {

                return dependency;

            } );

        }

        parse(callback) {

            const json = this.json;

            // Clear the loader cache
            this.cache.removeAll();

            // Fire the callback on complete
            this._withDependencies( [

                "scenes",
                "cameras",
                "animations"

            ] ).then( dependencies => {

                const scenes = [];

                for ( var name in dependencies.scenes ) {

                    scenes.push( dependencies.scenes[ name ] );

                }

                const scene = json.scene !== undefined ? dependencies.scenes[ json.scene ] : scenes[ 0 ];

                const cameras = [];

                for ( var name in dependencies.cameras ) {

                    const camera = dependencies.cameras[ name ];
                    cameras.push( camera );

                }

                const animations = [];

                for ( var name in dependencies.animations ) {

                    animations.push( dependencies.animations[ name ] );

                }

                callback( scene, scenes, cameras, animations );

            } );

        }

        loadShaders() {

            const json = this.json;
            const extensions = this.extensions;
            const options = this.options;

            return this._withDependencies( [

                "bufferViews"

            ] ).then( ({bufferViews}) => {

                return _each( json.shaders, shader => {

                    if ( shader.extensions && shader.extensions[ EXTENSIONS.KHR_BINARY_GLTF ] ) {

                        return extensions[ EXTENSIONS.KHR_BINARY_GLTF ].loadShader( shader, bufferViews );

                    }

                    return new Promise( resolve => {

                        const loader = new THREE.FileLoader( options.manager );
                        loader.setResponseType( 'text' );
                        loader.load( resolveURL( shader.uri, options.path ), shaderText => {

                            resolve( shaderText );

                        } );

                    } );

                } );

            } );

        }

        loadBuffers() {

            const json = this.json;
            const extensions = this.extensions;
            const options = this.options;

            return _each( json.buffers, ({type, uri}, name) => {

                if ( name === BINARY_EXTENSION_BUFFER_NAME ) {

                    return extensions[ EXTENSIONS.KHR_BINARY_GLTF ].body;

                }

                if ( type === 'arraybuffer' || type === undefined ) {

                    return new Promise( resolve => {

                        const loader = new THREE.FileLoader( options.manager );
                        loader.setResponseType( 'arraybuffer' );
                        loader.load( resolveURL( uri, options.path ), buffer => {

                            resolve( buffer );

                        } );

                    } );

                } else {

                    console.warn( `LegacyGLTFLoader: ${type} buffer type is not supported` );

                }

            } );

        }

        loadBufferViews() {

            const json = this.json;

            return this._withDependencies( [

                "buffers"

            ] ).then( ({buffers}) => {

                return _each( json.bufferViews, bufferView => {

                    const arraybuffer = buffers[ bufferView.buffer ];

                    const byteLength = bufferView.byteLength !== undefined ? bufferView.byteLength : 0;

                    return arraybuffer.slice( bufferView.byteOffset, bufferView.byteOffset + byteLength );

                } );

            } );

        }

        loadAccessors() {

            const json = this.json;

            return this._withDependencies( [

                "bufferViews"

            ] ).then( ({bufferViews}) => {

                return _each( json.accessors, accessor => {

                    const arraybuffer = bufferViews[ accessor.bufferView ];
                    const itemSize = WEBGL_TYPE_SIZES[ accessor.type ];
                    const TypedArray = WEBGL_COMPONENT_TYPES[ accessor.componentType ];

                    // For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
                    const elementBytes = TypedArray.BYTES_PER_ELEMENT;
                    const itemBytes = elementBytes * itemSize;

                    // The buffer is not interleaved if the stride is the item size in bytes.
                    if ( accessor.byteStride && accessor.byteStride !== itemBytes ) {

                        // Use the full buffer if it's interleaved.
                        var array = new TypedArray( arraybuffer );

                        // Integer parameters to IB/IBA are in array elements, not bytes.
                        const ib = new THREE.InterleavedBuffer( array, accessor.byteStride / elementBytes );

                        return new THREE.InterleavedBufferAttribute( ib, itemSize, accessor.byteOffset / elementBytes );

                    } else {

                        array = new TypedArray( arraybuffer, accessor.byteOffset, accessor.count * itemSize );

                        return new THREE.BufferAttribute( array, itemSize );

                    }

                } );

            } );

        }

        loadTextures() {

            const json = this.json;
            const extensions = this.extensions;
            const options = this.options;

            return this._withDependencies( [

                "bufferViews"

            ] ).then( ({bufferViews}) => {

                return _each( json.textures, texture => {

                    if ( texture.source ) {

                        return new Promise( resolve => {

                            const source = json.images[ texture.source ];
                            let sourceUri = source.uri;
                            let isObjectURL = false;

                            if ( source.extensions && source.extensions[ EXTENSIONS.KHR_BINARY_GLTF ] ) {

                                const metadata = source.extensions[ EXTENSIONS.KHR_BINARY_GLTF ];
                                const bufferView = bufferViews[ metadata.bufferView ];
                                const blob = new Blob( [ bufferView ], { type: metadata.mimeType } );
                                sourceUri = URL.createObjectURL( blob );
                                isObjectURL = true;

                            }

                            let textureLoader = THREE.Loader.Handlers.get( sourceUri );

                            if ( textureLoader === null ) {

                                textureLoader = new THREE.TextureLoader( options.manager );

                            }

                            textureLoader.setCrossOrigin( options.crossOrigin );

                            textureLoader.load( resolveURL( sourceUri, options.path ), _texture => {

                                if ( isObjectURL ) URL.revokeObjectURL( sourceUri );

                                _texture.flipY = false;

                                if ( texture.name !== undefined ) _texture.name = texture.name;

                                _texture.format = texture.format !== undefined ? WEBGL_TEXTURE_FORMATS[ texture.format ] : THREE.RGBAFormat;

                                if ( texture.internalFormat !== undefined && _texture.format !== WEBGL_TEXTURE_FORMATS[ texture.internalFormat ] ) {

                                    console.warn( 'LegacyGLTFLoader: Three.js doesn\'t support texture internalFormat which is different from texture format. ' +
                                                                'internalFormat will be forced to be the same value as format.' );

                                }

                                _texture.type = texture.type !== undefined ? WEBGL_TEXTURE_DATATYPES[ texture.type ] : THREE.UnsignedByteType;

                                if ( texture.sampler ) {

                                    const sampler = json.samplers[ texture.sampler ];

                                    _texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ] || THREE.LinearFilter;
                                    _texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ] || THREE.NearestMipMapLinearFilter;
                                    _texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ] || THREE.RepeatWrapping;
                                    _texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ] || THREE.RepeatWrapping;

                                }

                                resolve( _texture );

                            }, undefined, () => {

                                if ( isObjectURL ) URL.revokeObjectURL( sourceUri );

                                resolve();

                            } );

                        } );

                    }

                } );

            } );

        }

        loadMaterials() {

            const json = this.json;

            return this._withDependencies( [

                "shaders",
                "textures"

            ] ).then( ({shaders, textures}) => {

                return _each( json.materials, material => {

                    let materialType;
                    const materialValues = {};
                    const materialParams = {};

                    let khr_material;

                    if ( material.extensions && material.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ] ) {

                        khr_material = material.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ];

                    }

                    if ( khr_material ) {

                        // don't copy over unused values to avoid material warning spam
                        const keys = [ 'ambient', 'emission', 'transparent', 'transparency', 'doubleSided' ];

                        switch ( khr_material.technique ) {

                            case 'BLINN' :
                            case 'PHONG' :
                                materialType = THREE.MeshPhongMaterial;
                                keys.push( 'diffuse', 'specular', 'shininess' );
                                break;

                            case 'LAMBERT' :
                                materialType = THREE.MeshLambertMaterial;
                                keys.push( 'diffuse' );
                                break;

                            case 'CONSTANT' :
                            default :
                                materialType = THREE.MeshBasicMaterial;
                                break;

                        }

                        keys.forEach( v => {

                            if ( khr_material.values[ v ] !== undefined ) materialValues[ v ] = khr_material.values[ v ];

                        } );

                        if ( khr_material.doubleSided || materialValues.doubleSided ) {

                            materialParams.side = THREE.DoubleSide;

                        }

                        if ( khr_material.transparent || materialValues.transparent ) {

                            materialParams.transparent = true;
                            materialParams.opacity = ( materialValues.transparency !== undefined ) ? materialValues.transparency : 1;

                        }

                    } else if ( material.technique === undefined ) {

                        materialType = THREE.MeshPhongMaterial;

                        Object.assign( materialValues, material.values );

                    } else {

                        materialType = DeferredShaderMaterial;

                        const technique = json.techniques[ material.technique ];

                        materialParams.uniforms = {};

                        const program = json.programs[ technique.program ];

                        if ( program ) {

                            materialParams.fragmentShader = shaders[ program.fragmentShader ];

                            if ( ! materialParams.fragmentShader ) {

                                console.warn( "ERROR: Missing fragment shader definition:", program.fragmentShader );
                                materialType = THREE.MeshPhongMaterial;

                            }

                            const vertexShader = shaders[ program.vertexShader ];

                            if ( ! vertexShader ) {

                                console.warn( "ERROR: Missing vertex shader definition:", program.vertexShader );
                                materialType = THREE.MeshPhongMaterial;

                            }

                            // IMPORTANT: FIX VERTEX SHADER ATTRIBUTE DEFINITIONS
                            materialParams.vertexShader = replaceTHREEShaderAttributes( vertexShader, technique );

                            const uniforms = technique.uniforms;

                            for ( const uniformId in uniforms ) {

                                const pname = uniforms[ uniformId ];
                                const shaderParam = technique.parameters[ pname ];

                                const ptype = shaderParam.type;

                                if ( WEBGL_TYPE[ ptype ] ) {

                                    const pcount = shaderParam.count;
                                    let value;

                                    if ( material.values !== undefined ) value = material.values[ pname ];

                                    let uvalue = new WEBGL_TYPE[ ptype ]();
                                    const usemantic = shaderParam.semantic;
                                    const unode = shaderParam.node;

                                    switch ( ptype ) {

                                        case WEBGL_CONSTANTS.FLOAT:

                                            uvalue = shaderParam.value;

                                            if ( pname == "transparency" ) {

                                                materialParams.transparent = true;

                                            }

                                            if ( value !== undefined ) {

                                                uvalue = value;

                                            }

                                            break;

                                        case WEBGL_CONSTANTS.FLOAT_VEC2:
                                        case WEBGL_CONSTANTS.FLOAT_VEC3:
                                        case WEBGL_CONSTANTS.FLOAT_VEC4:
                                        case WEBGL_CONSTANTS.FLOAT_MAT3:

                                            if ( shaderParam && shaderParam.value ) {

                                                uvalue.fromArray( shaderParam.value );

                                            }

                                            if ( value ) {

                                                uvalue.fromArray( value );

                                            }

                                            break;

                                        case WEBGL_CONSTANTS.FLOAT_MAT2:

                                            // what to do?
                                            console.warn( "FLOAT_MAT2 is not a supported uniform type" );
                                            break;

                                        case WEBGL_CONSTANTS.FLOAT_MAT4:

                                            if ( pcount ) {

                                                uvalue = new Array( pcount );

                                                for ( let mi = 0; mi < pcount; mi ++ ) {

                                                    uvalue[ mi ] = new WEBGL_TYPE[ ptype ]();

                                                }

                                                if ( shaderParam && shaderParam.value ) {

                                                    const m4v = shaderParam.value;
                                                    uvalue.fromArray( m4v );

                                                }

                                                if ( value ) {

                                                    uvalue.fromArray( value );

                                                }

                                            } else {

                                                if ( shaderParam && shaderParam.value ) {

                                                    const m4 = shaderParam.value;
                                                    uvalue.fromArray( m4 );

                                                }

                                                if ( value ) {

                                                    uvalue.fromArray( value );

                                                }

                                            }

                                            break;

                                        case WEBGL_CONSTANTS.SAMPLER_2D:

                                            if ( value !== undefined ) {

                                                uvalue = textures[ value ];

                                            } else if ( shaderParam.value !== undefined ) {

                                                uvalue = textures[ shaderParam.value ];

                                            } else {

                                                uvalue = null;

                                            }

                                            break;

                                    }

                                    materialParams.uniforms[ uniformId ] = {
                                        value: uvalue,
                                        semantic: usemantic,
                                        node: unode
                                    };

                                } else {

                                    throw new Error( `Unknown shader uniform param type: ${ptype}` );

                                }

                            }

                            const states = technique.states || {};
                            const enables = states.enable || [];
                            const functions = states.functions || {};

                            let enableCullFace = false;
                            let enableDepthTest = false;
                            let enableBlend = false;

                            for ( let i = 0, il = enables.length; i < il; i ++ ) {

                                const enable = enables[ i ];

                                switch ( STATES_ENABLES[ enable ] ) {

                                    case 'CULL_FACE':

                                        enableCullFace = true;

                                        break;

                                    case 'DEPTH_TEST':

                                        enableDepthTest = true;

                                        break;

                                    case 'BLEND':

                                        enableBlend = true;

                                        break;

                                    // TODO: implement
                                    case 'SCISSOR_TEST':
                                    case 'POLYGON_OFFSET_FILL':
                                    case 'SAMPLE_ALPHA_TO_COVERAGE':

                                        break;

                                    default:

                                        throw new Error( `Unknown technique.states.enable: ${enable}` );

                                }

                            }

                            if ( enableCullFace ) {

                                materialParams.side = functions.cullFace !== undefined ? WEBGL_SIDES[ functions.cullFace ] : THREE.FrontSide;

                            } else {

                                materialParams.side = THREE.DoubleSide;

                            }

                            materialParams.depthTest = enableDepthTest;
                            materialParams.depthFunc = functions.depthFunc !== undefined ? WEBGL_DEPTH_FUNCS[ functions.depthFunc ] : THREE.LessDepth;
                            materialParams.depthWrite = functions.depthMask !== undefined ? functions.depthMask[ 0 ] : true;

                            materialParams.blending = enableBlend ? THREE.CustomBlending : THREE.NoBlending;
                            materialParams.transparent = enableBlend;

                            const blendEquationSeparate = functions.blendEquationSeparate;

                            if ( blendEquationSeparate !== undefined ) {

                                materialParams.blendEquation = WEBGL_BLEND_EQUATIONS[ blendEquationSeparate[ 0 ] ];
                                materialParams.blendEquationAlpha = WEBGL_BLEND_EQUATIONS[ blendEquationSeparate[ 1 ] ];

                            } else {

                                materialParams.blendEquation = THREE.AddEquation;
                                materialParams.blendEquationAlpha = THREE.AddEquation;

                            }

                            const blendFuncSeparate = functions.blendFuncSeparate;

                            if ( blendFuncSeparate !== undefined ) {

                                materialParams.blendSrc = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 0 ] ];
                                materialParams.blendDst = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 1 ] ];
                                materialParams.blendSrcAlpha = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 2 ] ];
                                materialParams.blendDstAlpha = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 3 ] ];

                            } else {

                                materialParams.blendSrc = THREE.OneFactor;
                                materialParams.blendDst = THREE.ZeroFactor;
                                materialParams.blendSrcAlpha = THREE.OneFactor;
                                materialParams.blendDstAlpha = THREE.ZeroFactor;

                            }

                        }

                    }

                    if ( Array.isArray( materialValues.diffuse ) ) {

                        materialParams.color = new THREE.Color().fromArray( materialValues.diffuse );

                    } else if ( typeof ( materialValues.diffuse ) === 'string' ) {

                        materialParams.map = textures[ materialValues.diffuse ];

                    }

                    delete materialParams.diffuse;

                    if ( typeof ( materialValues.reflective ) === 'string' ) {

                        materialParams.envMap = textures[ materialValues.reflective ];

                    }

                    if ( typeof ( materialValues.bump ) === 'string' ) {

                        materialParams.bumpMap = textures[ materialValues.bump ];

                    }

                    if ( Array.isArray( materialValues.emission ) ) {

                        if ( materialType === THREE.MeshBasicMaterial ) {

                            materialParams.color = new THREE.Color().fromArray( materialValues.emission );

                        } else {

                            materialParams.emissive = new THREE.Color().fromArray( materialValues.emission );

                        }

                    } else if ( typeof ( materialValues.emission ) === 'string' ) {

                        if ( materialType === THREE.MeshBasicMaterial ) {

                            materialParams.map = textures[ materialValues.emission ];

                        } else {

                            materialParams.emissiveMap = textures[ materialValues.emission ];

                        }

                    }

                    if ( Array.isArray( materialValues.specular ) ) {

                        materialParams.specular = new THREE.Color().fromArray( materialValues.specular );

                    } else if ( typeof ( materialValues.specular ) === 'string' ) {

                        materialParams.specularMap = textures[ materialValues.specular ];

                    }

                    if ( materialValues.shininess !== undefined ) {

                        materialParams.shininess = materialValues.shininess;

                    }

                    const _material = new materialType( materialParams );
                    if ( material.name !== undefined ) _material.name = material.name;

                    return _material;

                } );

            } );

        }

        loadMeshes() {

            const json = this.json;

            return this._withDependencies( [

                "accessors",
                "materials"

            ] ).then( ({accessors, materials}) => {

                return _each( json.meshes, mesh => {

                    const group = new THREE.Group();
                    if ( mesh.name !== undefined ) group.name = mesh.name;

                    if ( mesh.extras ) group.userData = mesh.extras;

                    const primitives = mesh.primitives || [];

                    for ( const name in primitives ) {

                        const primitive = primitives[ name ];

                        if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === undefined ) {

                            var geometry = new THREE.BufferGeometry();

                            var attributes = primitive.attributes;

                            for ( var attributeId in attributes ) {

                                var attributeEntry = attributes[ attributeId ];

                                if ( ! attributeEntry ) return;

                                var bufferAttribute = accessors[ attributeEntry ];

                                switch ( attributeId ) {

                                    case 'POSITION':
                                        geometry.addAttribute( 'position', bufferAttribute );
                                        break;

                                    case 'NORMAL':
                                        geometry.addAttribute( 'normal', bufferAttribute );
                                        break;

                                    case 'TEXCOORD_0':
                                    case 'TEXCOORD0':
                                    case 'TEXCOORD':
                                        geometry.addAttribute( 'uv', bufferAttribute );
                                        break;

                                    case 'TEXCOORD_1':
                                        geometry.addAttribute( 'uv2', bufferAttribute );
                                        break;

                                    case 'COLOR_0':
                                    case 'COLOR0':
                                    case 'COLOR':
                                        geometry.addAttribute( 'color', bufferAttribute );
                                        break;

                                    case 'WEIGHT':
                                        geometry.addAttribute( 'skinWeight', bufferAttribute );
                                        break;

                                    case 'JOINT':
                                        geometry.addAttribute( 'skinIndex', bufferAttribute );
                                        break;

                                    default:

                                        if ( ! primitive.material ) break;

                                        var material = json.materials[ primitive.material ];

                                        if ( ! material.technique ) break;

                                        const parameters = json.techniques[ material.technique ].parameters || {};

                                        for ( const attributeName in parameters ) {

                                            if ( parameters[ attributeName ][ 'semantic' ] === attributeId ) {

                                                geometry.addAttribute( attributeName, bufferAttribute );

                                            }

                                        }

                                }

                            }

                            if ( primitive.indices ) {

                                geometry.setIndex( accessors[ primitive.indices ] );

                            }

                            var material = materials !== undefined ? materials[ primitive.material ] : createDefaultMaterial();

                            var meshNode = new THREE.Mesh( geometry, material );
                            meshNode.castShadow = true;
                            meshNode.name = ( name === "0" ? group.name : group.name + name );

                            if ( primitive.extras ) meshNode.userData = primitive.extras;

                            group.add( meshNode );

                        } else if ( primitive.mode === WEBGL_CONSTANTS.LINES ) {

                            var geometry = new THREE.BufferGeometry();

                            var attributes = primitive.attributes;

                            for ( var attributeId in attributes ) {

                                var attributeEntry = attributes[ attributeId ];

                                if ( ! attributeEntry ) return;

                                var bufferAttribute = accessors[ attributeEntry ];

                                switch ( attributeId ) {

                                    case 'POSITION':
                                        geometry.addAttribute( 'position', bufferAttribute );
                                        break;

                                    case 'COLOR_0':
                                    case 'COLOR0':
                                    case 'COLOR':
                                        geometry.addAttribute( 'color', bufferAttribute );
                                        break;

                                }

                            }

                            var material = materials[ primitive.material ];

                            var meshNode;

                            if ( primitive.indices ) {

                                geometry.setIndex( accessors[ primitive.indices ] );

                                meshNode = new THREE.LineSegments( geometry, material );

                            } else {

                                meshNode = new THREE.Line( geometry, material );

                            }

                            meshNode.name = ( name === "0" ? group.name : group.name + name );

                            if ( primitive.extras ) meshNode.userData = primitive.extras;

                            group.add( meshNode );

                        } else {

                            console.warn( "Only triangular and line primitives are supported" );

                        }

                    }

                    return group;

                } );

            } );

        }

        loadCameras() {

            const json = this.json;

            return _each( json.cameras, camera => {

                if ( camera.type == "perspective" && camera.perspective ) {

                    const yfov = camera.perspective.yfov;
                    const aspectRatio = camera.perspective.aspectRatio !== undefined ? camera.perspective.aspectRatio : 1;

                    // According to COLLADA spec...
                    // aspectRatio = xfov / yfov
                    const xfov = yfov * aspectRatio;

                    var _camera = new THREE.PerspectiveCamera( THREE.Math.radToDeg( xfov ), aspectRatio, camera.perspective.znear || 1, camera.perspective.zfar || 2e6 );
                    if ( camera.name !== undefined ) _camera.name = camera.name;

                    if ( camera.extras ) _camera.userData = camera.extras;

                    return _camera;

                } else if ( camera.type == "orthographic" && camera.orthographic ) {

                    var _camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, camera.orthographic.znear, camera.orthographic.zfar );
                    if ( camera.name !== undefined ) _camera.name = camera.name;

                    if ( camera.extras ) _camera.userData = camera.extras;

                    return _camera;

                }

            } );

        }

        loadSkins() {

            const json = this.json;

            return this._withDependencies( [

                "accessors"

            ] ).then( ({accessors}) => {

                return _each( json.skins, skin => {

                    const bindShapeMatrix = new THREE.Matrix4();

                    if ( skin.bindShapeMatrix !== undefined ) bindShapeMatrix.fromArray( skin.bindShapeMatrix );

                    const _skin = {
                        bindShapeMatrix,
                        jointNames: skin.jointNames,
                        inverseBindMatrices: accessors[ skin.inverseBindMatrices ]
                    };

                    return _skin;

                } );

            } );

        }

        loadAnimations() {

            const json = this.json;

            return this._withDependencies( [

                "accessors",
                "nodes"

            ] ).then( ({accessors, nodes}) => {

                return _each( json.animations, (animation, animationId) => {

                    const tracks = [];

                    for ( const channelId in animation.channels ) {

                        const channel = animation.channels[ channelId ];
                        const sampler = animation.samplers[ channel.sampler ];

                        if ( sampler ) {

                            const target = channel.target;
                            var name = target.id;
                            const input = animation.parameters !== undefined ? animation.parameters[ sampler.input ] : sampler.input;
                            const output = animation.parameters !== undefined ? animation.parameters[ sampler.output ] : sampler.output;

                            const inputAccessor = accessors[ input ];
                            const outputAccessor = accessors[ output ];

                            const node = nodes[ name ];

                            if ( node ) {

                                node.updateMatrix();
                                node.matrixAutoUpdate = true;

                                const TypedKeyframeTrack = PATH_PROPERTIES[ target.path ] === PATH_PROPERTIES.rotation
                                    ? THREE.QuaternionKeyframeTrack
                                    : THREE.VectorKeyframeTrack;

                                const targetName = node.name ? node.name : node.uuid;
                                const interpolation = sampler.interpolation !== undefined ? INTERPOLATION[ sampler.interpolation ] : THREE.InterpolateLinear;

                                // KeyframeTrack.optimize() will modify given 'times' and 'values'
                                // buffers before creating a truncated copy to keep. Because buffers may
                                // be reused by other tracks, make copies here.
                                tracks.push( new TypedKeyframeTrack(
                                    `${targetName}.${PATH_PROPERTIES[ target.path ]}`,
                                    THREE.AnimationUtils.arraySlice( inputAccessor.array, 0 ),
                                    THREE.AnimationUtils.arraySlice( outputAccessor.array, 0 ),
                                    interpolation
                                ) );

                            }

                        }

                    }

                    var name = animation.name !== undefined ? animation.name : `animation_${animationId}`;

                    return new THREE.AnimationClip( name, undefined, tracks );

                } );

            } );

        }

        loadNodes() {

            const json = this.json;
            const extensions = this.extensions;
            const scope = this;

            return _each( json.nodes, node => {

                const matrix = new THREE.Matrix4();

                let _node;

                if ( node.jointName ) {

                    _node = new THREE.Bone();
                    _node.name = node.name !== undefined ? node.name : node.jointName;
                    _node.jointName = node.jointName;

                } else {

                    _node = new THREE.Object3D();
                    if ( node.name !== undefined ) _node.name = node.name;

                }

                if ( node.extras ) _node.userData = node.extras;

                if ( node.matrix !== undefined ) {

                    matrix.fromArray( node.matrix );
                    _node.applyMatrix( matrix );

                } else {

                    if ( node.translation !== undefined ) {

                        _node.position.fromArray( node.translation );

                    }

                    if ( node.rotation !== undefined ) {

                        _node.quaternion.fromArray( node.rotation );

                    }

                    if ( node.scale !== undefined ) {

                        _node.scale.fromArray( node.scale );

                    }

                }

                return _node;

            } ).then( __nodes => {

                return scope._withDependencies( [

                    "meshes",
                    "skins",
                    "cameras"

                ] ).then( ({meshes, skins, cameras}) => {

                    return _each( __nodes, (_node, nodeId) => {

                        const node = json.nodes[ nodeId ];

                        if ( node.meshes !== undefined ) {

                            for ( const meshId in node.meshes ) {

                                const mesh = node.meshes[ meshId ];
                                const group = meshes[ mesh ];

                                if ( group === undefined ) {

                                    console.warn( `LegacyGLTFLoader: Couldn't find node "${mesh}".` );
                                    continue;

                                }

                                for ( const childrenId in group.children ) {

                                    let child = group.children[ childrenId ];

                                    // clone Mesh to add to _node

                                    let originalMaterial = child.material;
                                    const originalGeometry = child.geometry;
                                    const originalUserData = child.userData;
                                    const originalName = child.name;

                                    var material;

                                    if ( originalMaterial.isDeferredShaderMaterial ) {

                                        originalMaterial = material = originalMaterial.create();

                                    } else {

                                        material = originalMaterial;

                                    }

                                    switch ( child.type ) {

                                        case 'LineSegments':
                                            child = new THREE.LineSegments( originalGeometry, material );
                                            break;

                                        case 'LineLoop':
                                            child = new THREE.LineLoop( originalGeometry, material );
                                            break;

                                        case 'Line':
                                            child = new THREE.Line( originalGeometry, material );
                                            break;

                                        default:
                                            child = new THREE.Mesh( originalGeometry, material );

                                    }

                                    child.castShadow = true;
                                    child.userData = originalUserData;
                                    child.name = originalName;

                                    let skinEntry;

                                    if ( node.skin ) {

                                        skinEntry = skins[ node.skin ];

                                    }

                                    // Replace Mesh with SkinnedMesh in library
                                    if ( skinEntry ) {

                                        const getJointNode = jointId => {

                                            const keys = Object.keys( __nodes );

                                            for ( let i = 0, il = keys.length; i < il; i ++ ) {

                                                const n = __nodes[ keys[ i ] ];

                                                if ( n.jointName === jointId ) return n;

                                            }

                                            return null;

                                        };

                                        const geometry = originalGeometry;
                                        var material = originalMaterial;
                                        material.skinning = true;

                                        child = new THREE.SkinnedMesh( geometry, material );
                                        child.castShadow = true;
                                        child.userData = originalUserData;
                                        child.name = originalName;

                                        const bones = [];
                                        const boneInverses = [];

                                        for ( let i = 0, l = skinEntry.jointNames.length; i < l; i ++ ) {

                                            const jointId = skinEntry.jointNames[ i ];
                                            const jointNode = getJointNode( jointId );

                                            if ( jointNode ) {

                                                bones.push( jointNode );

                                                const m = skinEntry.inverseBindMatrices.array;
                                                const mat = new THREE.Matrix4().fromArray( m, i * 16 );
                                                boneInverses.push( mat );

                                            } else {

                                                console.warn( `WARNING: joint: '${jointId}' could not be found` );

                                            }

                                        }

                                        child.bind( new THREE.Skeleton( bones, boneInverses ), skinEntry.bindShapeMatrix );

                                        const buildBoneGraph = (parentJson, parentObject, property) => {

                                            const children = parentJson[ property ];

                                            if ( children === undefined ) return;

                                            for ( let i = 0, il = children.length; i < il; i ++ ) {

                                                const nodeId = children[ i ];
                                                const bone = __nodes[ nodeId ];
                                                const boneJson = json.nodes[ nodeId ];

                                                if ( bone !== undefined && bone.isBone === true && boneJson !== undefined ) {

                                                    parentObject.add( bone );
                                                    buildBoneGraph( boneJson, bone, 'children' );

                                                }

                                            }

                                        };

                                        buildBoneGraph( node, child, 'skeletons' );

                                    }

                                    _node.add( child );

                                }

                            }

                        }

                        if ( node.camera !== undefined ) {

                            const camera = cameras[ node.camera ];

                            _node.add( camera );

                        }

                        if ( node.extensions
                                 && node.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ]
                                 && node.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ].light ) {

                            const extensionLights = extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ].lights;
                            const light = extensionLights[ node.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ].light ];

                            _node.add( light );

                        }

                        return _node;

                    } );

                } );

            } );

        }

        loadScenes() {

            const json = this.json;

            // scene node hierachy builder

            function buildNodeHierachy( nodeId, parentObject, allNodes ) {

                const _node = allNodes[ nodeId ];
                parentObject.add( _node );

                const node = json.nodes[ nodeId ];

                if ( node.children ) {

                    const children = node.children;

                    for ( let i = 0, l = children.length; i < l; i ++ ) {

                        const child = children[ i ];
                        buildNodeHierachy( child, _node, allNodes );

                    }

                }

            }

            return this._withDependencies( [

                "nodes"

            ] ).then( dependencies => {

                return _each( json.scenes, scene => {

                    const _scene = new THREE.Scene();
                    if ( scene.name !== undefined ) _scene.name = scene.name;

                    if ( scene.extras ) _scene.userData = scene.extras;

                    const nodes = scene.nodes || [];

                    for ( let i = 0, l = nodes.length; i < l; i ++ ) {

                        const nodeId = nodes[ i ];
                        buildNodeHierachy( nodeId, _scene, dependencies.nodes );

                    }

                    _scene.traverse( child => {

                        // Register raw material meshes with LegacyGLTFLoader.Shaders
                        if ( child.material && child.material.isRawShaderMaterial ) {

                            child.gltfShader = new GLTFShader( child, dependencies.nodes );
                            child.onBeforeRender = function ( renderer, scene, camera ) {

                                this.gltfShader.update( scene, camera );

                            };

                        }

                    } );

                    return _scene;

                } );

            } );

        }
    }

    return LegacyGLTFLoader;
})();

export default LegacyGLTFLoader;