/**
 * @author mrdoob / http://mrdoob.com/
 * @rewrite komsan
 */

const KMZLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

KMZLoader.prototype = {

	constructor: KMZLoader,

	load(url, onLoad, onProgress, onError) {

		const scope = this;

		const loader = new THREE.FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, text => {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setPath(value) {

		this.path = value;
		return this;

	},

	parse(data) {

		function findFile( url ) {

			for ( const path in zip.files ) {

				if ( path.substr( - url.length ) === url ) {

					return zip.files[ path ];

				}

			}

		}

		const manager = new THREE.LoadingManager();
		manager.setURLModifier( url => {

			const image = findFile( url );

			if ( image ) {

				console.log( 'Loading', url );

				const blob = new Blob( [ image.asArrayBuffer() ], { type: 'application/octet-stream' } );
				return URL.createObjectURL( blob );

			}

			return url;

		} );

		//

		var zip = new JSZip( data ); // eslint-disable-line no-undef

		if ( zip.files[ 'doc.kml' ] ) {

			const xml = new DOMParser().parseFromString( zip.files[ 'doc.kml' ].asText(), 'application/xml' );

			const model = xml.querySelector( 'Placemark Model Link href' );

			if ( model ) {

				var loader = new THREE.ColladaLoader( manager );
				return loader.parse( zip.files[ model.textContent ].asText() );

			}

		} else {

			console.warn( 'KMZLoader: Missing doc.kml file.' );

			for ( const path in zip.files ) {

				const extension = path.split( '.' ).pop().toLowerCase();

				if ( extension === 'dae' ) {

					var loader = new THREE.ColladaLoader( manager );
					return loader.parse( zip.files[ path ].asText() );

				}

			}

		}

		console.error( 'KMZLoader: Couldn\'t find .dae file.' );
		return { scene: new THREE.Group() };

	}

};

export default KMZLoader;