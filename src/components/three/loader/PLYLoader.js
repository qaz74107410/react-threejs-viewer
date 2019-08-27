/**
 * @author Wei Meng / http://about.me/menway
 * @rewrite komsan
 *
 * Description: A THREE loader for PLY ASCII files (known as the Polygon
 * File Format or the Stanford Triangle Format).
 *
 * Limitations: ASCII decoding assumes file is UTF-8.
 *
 * Usage:
 *	var loader = new PLYLoader();
 *	loader.load('./models/ply/ascii/dolphins.ply', function (geometry) {
 *
 *		scene.add( new THREE.Mesh( geometry ) );
 *
 *	} );
 *
 * If the PLY file uses non standard property names, they can be mapped while
 * loading. For example, the following maps the properties
 * “diffuse_(red|green|blue)” in the file to standard color names.
 *
 * loader.setPropertyNameMapping( {
 *	diffuse_red: 'red',
 *	diffuse_green: 'green',
 *	diffuse_blue: 'blue'
 * } );
 *
 */

import * as THREE from 'three';

const PLYLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	this.propertyNameMapping = {};

};

PLYLoader.prototype = {

	constructor: PLYLoader,

	load(url, onLoad, onProgress, onError) {

		const scope = this;

		const loader = new THREE.FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, text => {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setPath(value) {

		this.path = value;
		return this;

	},

	setPropertyNameMapping(mapping) {

		this.propertyNameMapping = mapping;

	},

	parse(data) {

		function parseHeader( data ) {
            const patternHeader = /ply([\s\S]*)end_header\r?\n/;
            let headerText = '';
            let headerLength = 0;
            const result = patternHeader.exec( data );

            if ( result !== null ) {

				headerText = result[ 1 ];
				headerLength = result[ 0 ].length;

			}

            const header = {
				comments: [],
				elements: [],
				headerLength
			};

            const lines = headerText.split( '\n' );
            let currentElement;
            let lineType;
            let lineValues;

            function make_ply_element_property( propertValues, propertyNameMapping ) {

				const property = { type: propertValues[ 0 ] };

				if ( property.type === 'list' ) {

					property.name = propertValues[ 3 ];
					property.countType = propertValues[ 1 ];
					property.itemType = propertValues[ 2 ];

				} else {

					property.name = propertValues[ 1 ];

				}

				if ( property.name in propertyNameMapping ) {

					property.name = propertyNameMapping[ property.name ];

				}

				return property;

			}

            for (let line of lines) {
                line = line.trim();

                if ( line === '' ) continue;

                lineValues = line.split( /\s+/ );
                lineType = lineValues.shift();
                line = lineValues.join( ' ' );

                switch ( lineType ) {

					case 'format':

						header.format = lineValues[ 0 ];
						header.version = lineValues[ 1 ];

						break;

					case 'comment':

						header.comments.push( line );

						break;

					case 'element':

						if ( currentElement !== undefined ) {

							header.elements.push( currentElement );

						}

						currentElement = {};
						currentElement.name = lineValues[ 0 ];
						currentElement.count = parseInt( lineValues[ 1 ] );
						currentElement.properties = [];

						break;

					case 'property':

						currentElement.properties.push( make_ply_element_property( lineValues, scope.propertyNameMapping ) );

						break;


					default:

						console.log( 'unhandled', lineType, lineValues );

				}
            }

            if ( currentElement !== undefined ) {

				header.elements.push( currentElement );

			}

            return header;
        }

		function parseASCIINumber( n, type ) {

			switch ( type ) {

				case 'char': case 'uchar': case 'short': case 'ushort': case 'int': case 'uint':
				case 'int8': case 'uint8': case 'int16': case 'uint16': case 'int32': case 'uint32':

					return parseInt( n );

				case 'float': case 'double': case 'float32': case 'float64':

					return parseFloat( n );

			}

		}

		function parseASCIIElement( properties, line ) {

			const values = line.split( /\s+/ );

			const element = {};

			for ( let i = 0; i < properties.length; i ++ ) {

				if ( properties[ i ].type === 'list' ) {

					const list = [];
					const n = parseASCIINumber( values.shift(), properties[ i ].countType );

					for ( let j = 0; j < n; j ++ ) {

						list.push( parseASCIINumber( values.shift(), properties[ i ].itemType ) );

					}

					element[ properties[ i ].name ] = list;

				} else {

					element[ properties[ i ].name ] = parseASCIINumber( values.shift(), properties[ i ].type );

				}

			}

			return element;

		}

		function parseASCII(data, {elements}) {
            // PLY ascii format specification, as per http://en.wikipedia.org/wiki/PLY_(file_format)

            const buffer = {
				indices: [],
				vertices: [],
				normals: [],
				uvs: [],
				faceVertexUvs: [],
				colors: []
			};

            let result;

            const patternBody = /end_header\s([\s\S]*)$/;
            let body = '';
            if ( ( result = patternBody.exec( data ) ) !== null ) {

				body = result[ 1 ];

			}

            const lines = body.split( '\n' );
            let currentElement = 0;
            let currentElementCount = 0;

            for (let line of lines) {
                line = line.trim();
                if ( line === '' ) {

					continue;

				}

                if ( currentElementCount >= elements[ currentElement ].count ) {

					currentElement ++;
					currentElementCount = 0;

				}

                const element = parseASCIIElement( elements[ currentElement ].properties, line );

                handleElement( buffer, elements[ currentElement ].name, element );

                currentElementCount ++;
            }

            return postProcess( buffer );
        }

		function postProcess( buffer ) {

			let geometry = new THREE.BufferGeometry();

			// mandatory buffer data

			if ( buffer.indices.length > 0 ) {

				geometry.setIndex( buffer.indices );

			}

			geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( buffer.vertices, 3 ) );

			// optional buffer data

			if ( buffer.normals.length > 0 ) {

				geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( buffer.normals, 3 ) );

			}

			if ( buffer.uvs.length > 0 ) {

				geometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( buffer.uvs, 2 ) );

			}

			if ( buffer.colors.length > 0 ) {

				geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( buffer.colors, 3 ) );

			}

			if ( buffer.faceVertexUvs.length > 0 ) {

				geometry = geometry.toNonIndexed();
				geometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( buffer.faceVertexUvs, 2 ) );

			}

			geometry.computeBoundingSphere();

			return geometry;

		}

		function handleElement( buffer, elementName, element ) {

			if ( elementName === 'vertex' ) {

				buffer.vertices.push( element.x, element.y, element.z );

				if ( 'nx' in element && 'ny' in element && 'nz' in element ) {

					buffer.normals.push( element.nx, element.ny, element.nz );

				}

				if ( 's' in element && 't' in element ) {

					buffer.uvs.push( element.s, element.t );

				}

				if ( 'red' in element && 'green' in element && 'blue' in element ) {

					buffer.colors.push( element.red / 255.0, element.green / 255.0, element.blue / 255.0 );

				}

			} else if ( elementName === 'face' ) {

				const vertex_indices = element.vertex_indices || element.vertex_index; // issue #9338
				const texcoord = element.texcoord;

				if ( vertex_indices.length === 3 ) {

					buffer.indices.push( vertex_indices[ 0 ], vertex_indices[ 1 ], vertex_indices[ 2 ] );

					if ( texcoord && texcoord.length === 6 ) {

						buffer.faceVertexUvs.push( texcoord[ 0 ], texcoord[ 1 ] );
						buffer.faceVertexUvs.push( texcoord[ 2 ], texcoord[ 3 ] );
						buffer.faceVertexUvs.push( texcoord[ 4 ], texcoord[ 5 ] );

					}

				} else if ( vertex_indices.length === 4 ) {

					buffer.indices.push( vertex_indices[ 0 ], vertex_indices[ 1 ], vertex_indices[ 3 ] );
					buffer.indices.push( vertex_indices[ 1 ], vertex_indices[ 2 ], vertex_indices[ 3 ] );

				}

			}

		}

		function binaryRead( dataview, at, type, little_endian ) {

			switch ( type ) {

				// corespondences for non-specific length types here match rply:
				case 'int8':		case 'char':	 return [ dataview.getInt8( at ), 1 ];
				case 'uint8':		case 'uchar':	 return [ dataview.getUint8( at ), 1 ];
				case 'int16':		case 'short':	 return [ dataview.getInt16( at, little_endian ), 2 ];
				case 'uint16':	case 'ushort': return [ dataview.getUint16( at, little_endian ), 2 ];
				case 'int32':		case 'int':		 return [ dataview.getInt32( at, little_endian ), 4 ];
				case 'uint32':	case 'uint':	 return [ dataview.getUint32( at, little_endian ), 4 ];
				case 'float32': case 'float':	 return [ dataview.getFloat32( at, little_endian ), 4 ];
				case 'float64': case 'double': return [ dataview.getFloat64( at, little_endian ), 8 ];

			}

		}

		function binaryReadElement( dataview, at, properties, little_endian ) {
            const element = {};
            let result;
            let read = 0;

            for ( let i = 0; i < properties.length; i ++ ) {

				if ( properties[ i ].type === 'list' ) {

					const list = [];

					result = binaryRead( dataview, at + read, properties[ i ].countType, little_endian );
					const n = result[ 0 ];
					read += result[ 1 ];

					for ( let j = 0; j < n; j ++ ) {

						result = binaryRead( dataview, at + read, properties[ i ].itemType, little_endian );
						list.push( result[ 0 ] );
						read += result[ 1 ];

					}

					element[ properties[ i ].name ] = list;

				} else {

					result = binaryRead( dataview, at + read, properties[ i ].type, little_endian );
					element[ properties[ i ].name ] = result[ 0 ];
					read += result[ 1 ];

				}

			}

            return [ element, read ];
        }

		function parseBinary(data, {format, headerLength, elements}) {
            const buffer = {
				indices: [],
				vertices: [],
				normals: [],
				uvs: [],
				faceVertexUvs: [],
				colors: []
			};

            const little_endian = ( format === 'binary_little_endian' );
            const body = new DataView( data, headerLength );
            let result;
            let loc = 0;

            for ( let currentElement = 0; currentElement < elements.length; currentElement ++ ) {

				for ( let currentElementCount = 0; currentElementCount < elements[ currentElement ].count; currentElementCount ++ ) {

					result = binaryReadElement( body, loc, elements[ currentElement ].properties, little_endian );
					loc += result[ 1 ];
					const element = result[ 0 ];

					handleElement( buffer, elements[ currentElement ].name, element );

				}

			}

            return postProcess( buffer );
        }

		//

		let geometry;
		var scope = this;

		if ( data instanceof ArrayBuffer ) {

			const text = THREE.LoaderUtils.decodeText( new Uint8Array( data ) );
			const header = parseHeader( text );

			geometry = header.format === 'ascii' ? parseASCII( text, header ) : parseBinary( data, header );

		} else {

			geometry = parseASCII( data, parseHeader( data ) );

		}

		return geometry;

	}

};

export default PLYLoader;