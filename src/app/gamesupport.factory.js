'use strict';

/**
 * @ngdoc service
 * @name gamesupport
 * @description
 * Tests game support features for the current web browser environment.
 */
angular.module('app').factory('gameSupport', function(){

	/**
	 * determine if current browser has asm.js support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasAsm(){
		return true;
	}

	/**
	 * determine if current browser has DOM Level 3 support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasDomLevel3(){
		return true;
	}

	/**
	 * determine if current browser has WebAssembly support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasWebAssembly(){
		return false;
	}

	/**
	 * determine if current browser has IndexedDB storage support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasIndexedDb(){
		return !!('indexedDB' in window || 'mozIndexedDB' in window || 'webkitIndexedDB' in window || 'msIndexedDB' in window);
	}

	/**
	 * determine if current browser has serviceWorker support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasServiceWorker(){
		return !!(navigator.serviceWorker);
	}

	/**
	 * determine if current browser has Canvas support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasCanvas(){
		var canvas = document.createElement('canvas');
		return !!(canvas && canvas.getContext && canvas.getContext('2d'));
	}

	/**
	 * determine if current browser has WebGL1 support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasWebGl(){
		if ('WebGLRenderingContext' in window){
			var canvas = document.createElement('canvas');
			if (canvas){
				return !!(canvas.getContext('webgl'));
			}
		}
		return false;
	}

	/**
	 * determine if current browser has WebGL2 support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasWebGl2(){
		if ('WebGL2RenderingContext' in window){
			var canvas = document.createElement('canvas');
			if (canvas){
				return !!(canvas.getContext('webgl', {version: 2}));
			}
		}
		return false;
	}

	/**
	 * determine if current browser has Audio support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasWebAudio(){
		return !!('AudioContext' in window || 'webkitAudioContext' in window);
	}

	/**
	 * determine if current browser has WebSocket support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasWebSocket(){
		return !!('WebSocket' in window);
	}

	/**
	 * determine if current browser has WebRTC support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasWebRtc(){
		return !!('RTCPeerConnection' in window || 'mozRTCPeerConnection' in window || 'webkitRTCPeerConnection' in window || 'msRTCPeerConnection' in window);
	}

	/**
	 * determine if current browser has gamepad support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasGamepad(){
		return !!('Gamepad' in window);
	}

	/**
	 * determine if current browser has touch support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasTouch(){
		return !!('Touch' in window);
	}

	/**
	 * determine if current browser has motion support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasMotion(){
		return !!('DeviceMotionEvent' in window && window.DeviceMotionEvent.acceleration);
	}

	/**
	 * determine if current browser has pointer support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasPointer(){
		return !!('onmousemove' in window);
	}

	/**
	 * determine if current browser has keyboard support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasKeyboard(){
		return !!(KeyboardEvent);
	}

	/**
	 * determine if current browser has fullscreen support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasFullscreen(){
		var div = document.createElement('div');
		return !!(div && div.requestFullscreen || div.msRequestFullscreen || div.mozRequestFullScreen || div.webkitRequestFullscreen);
	}

	/**
	 * determine if current browser has orientation support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasOrientation(){
		return !!('screen' in window && (window.screen.orientation || window.screen.mozOrientation || window.screen.webkitOrientation || window.screen.msOrientation));
	}

	/**
	 * determine if current browser has battery support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasBattery(){
		return !!(navigator.battery || navigator.mozBattery || navigator.webkitBattery);
	}

	/**
	 * determine if current browser has vibrate support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasVibrate(){
		return !!(navigator.vibrate);
	}

	/**
	 * determine if current browser has page visibility support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasVisibility(){
		return !!('visibilityState' in document || 'hidden' in document);
	}

	/**
	 * determine if current browser has geolocation support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasGeoLocation(){
		return !!(navigator.geolocation);
	}

	/**
	 * determine how many logical cores the current browser has access to
	 *
	 * @param {Void}
	 * @return {Integer}
	 */
	function getLogicalCores(){
		var cores = -1;
		if ('hardwareConcurrency' in navigator){
			cores = navigator.hardwareConcurrency;
		}
		return cores;
	}

	/**
	 * determine if current browser has performance measurement support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasPerformance(){
		return !!('performance' in window && performance.now);
	}

	/**
	 * determine if current browser has SIMD support
	 *
	 * @param {Void}
	 * @return {Boolean}
	 */
	function hasSimd(){
		return !!('SIMD' in window);
	}

	function hasMathImul(){
		return !!('imul' in Math);
	}

	function hasMathFround(){
		return !!('fround' in Math);
	}

	function hasArrayBufferTransfer(){
		return !!('ArrayBuffer' in window && 'transfer' in ArrayBuffer);
	}

	function hasPointerLock(){
		var div = document.createElement('div');
		return !!(div.requestPointerLock || div.mozRequestPointerLock || div.webkitRequestPointerLock || div.msRequestPointerLock);
	}

	function hasBlobConstructor(){
		try {
			var blob = new Blob();
			return !!(blob);
		} catch(e){
		}
		return false;
	}

	function hasBlobBuilder(){
		return !!(!hasBlobConstructor() && ('BlobBuilder' in window || 'MozBlobBuilder' in window || 'WebKitBlobBuilder' in window));
	}

	function hasSharedArrayBuffer(){
		return !!('SharedArrayBuffer' in window);
	}

	function hasWebWorkers(){
		return !!('Worker' in window);
	}

	function hasRequestAnimationFrame(){
		return !!('requestAnimationFrame' in window);
	}

	function getEsVersion(){

		window.es = {
			versions: [
				'1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '2.0'
			],
			version: ''
		};

		for (var i = 0; i < window.es.versions.length; i++){
			var el = document.createElement('script');
			el.setAttribute('language', 'JavaScript' + window.es.versions[i]);
			el.text = 'window.es.version = "' + window.es.versions[i] + '";';
			document.getElementsByTagName('head')[0].appendChild(el);
		}

		return parseFloat(window.es.version);

	}

	function hasOptimizedJavaScript(){
		return (getEsVersion() >= 1.5);
	}

	/**
	 * determine if the current web browser has a particular feature
	 *
	 * @param {String} feature
	 * @param {Boolean} [advanced] default=false
	 * @return {Boolean} null if unrecognized
	 */
	function hasFeature(feature, advanced){

		var result = null;
		var features = getFeatures(advanced);

		if (_.includes(features, feature)){
			_.each(_advancedHierarchy, function(category){
				_.each(category, function(obj, featureKey){
					if (featureKey.toLowerCase() === feature.toLowerCase()){
						result = obj;
					}
				});
			});
		}

		return result;

	}

	/**
	 * determine if the current browser has a particular combination of features
	 *
	 * @param {Array} features
	 * @return {Boolean}
	 */
	function hasFeatures(features){

		var results = [];
		_.each(features, function(feature){
			results.push(hasFeature(feature));
		});
		return _.every(results, _.identity);

	}

	/**
	 * get a list of feature categories
	 *
	 * @param {Boolean} [advanced] default=false
	 * @return {Array}
	 */
	function getCategories(advanced){
		if (advanced){
			return _.keys(_advancedHierarchy);
		} else {
			return _.keys(_basicHierarchy);
		}
	}

	/**
	 * get a list of features
	 *
	 * @param {Boolean} [advanced] default=false
	 * @return {Array}
	 */
	function getFeatures(advanced){
		var features = [];
		var hierarchy = (advanced) ? _advancedHierarchy : _basicHierarchy;
		_.each(hierarchy, function(category){
			_.each(category, function(feature, featureKey){
				features.push(featureKey);
			});
		});
		return features;
	}

	/**
	 * get the feature hierarchy
	 *
	 * @param {Boolean} [advanced] default=false
	 * @return {Object}
	 */
	function getHierarchy(advanced){
		return (advanced) ? _advancedHierarchy : _basicHierarchy;
	}

	/**
	 * basic game support feature hierarchy
	 * @var {Object}
	 */
	var _basicHierarchy = {
		cpu: {
			asm					: hasAsm(),
			optimizedJavaScript	: hasOptimizedJavaScript(),
			webAssembly			: hasWebAssembly(),
			sharedArrayBuffer	: hasSharedArrayBuffer(),
			simd				: hasSimd(),
		},
		graphics: {
			canvas				: hasCanvas(),
			webGl				: hasWebGl(),
			webGl2				: hasWebGl2(),
		},
		audio: {
			webAudio			: hasWebAudio(),
		},
		experience: {
			fullscreen			: hasFullscreen(),
			pointerLock			: hasPointerLock(),
		},
		storage: {
			indexedDb			: hasIndexedDb(),
			serviceWorker		: hasServiceWorker(),
		},
		multiplayer: {
			webSocket			: hasWebSocket(),
			webRtc				: hasWebRtc(),
		},
		input: {
			domLevel3			: hasDomLevel3(),
			touch				: hasTouch(),
			gamepad				: hasGamepad(),
		}
	};

	/**
	 * advanced game support feature hierarchy
	 * @var {Object}
	 */
	var _advancedHierarchy = {
		cpu: {
			asm						: hasAsm(),
			optimizedJavaScript		: hasOptimizedJavaScript(),
			webAssembly				: hasWebAssembly(),
			sharedArrayBuffer		: hasSharedArrayBuffer(),
			simd					: hasSimd(),
			logicalCores			: getLogicalCores(),
			performance				: hasPerformance(),
			mathImul				: hasMathImul(),
			mathFround				: hasMathFround(),
			arrayBufferTransfer		: hasArrayBufferTransfer(),
			blobConstructor			: hasBlobConstructor(),
			blobBuilder				: hasBlobBuilder(),
			webWorkers				: hasWebWorkers(),
			requestAnimationFrame	: hasRequestAnimationFrame(),
			esVersion				: getEsVersion()
		},
		graphics: {
			canvas					: hasCanvas(),
			webGl					: hasWebGl(),
			webGl2					: hasWebGl2(),
		},
		audio: {
			webAudio				: hasWebAudio(),
		},
		experience: {
			fullscreen				: hasFullscreen(),
			pointerLock				: hasPointerLock(),
			orientation				: hasOrientation(),
			battery					: hasBattery(),
			vibrate					: hasVibrate(),
			visibility				: hasVisibility(),
			geoLocation				: hasGeoLocation(),
		},
		storage: {
			indexedDb				: hasIndexedDb(),
			serviceWorker			: hasServiceWorker(),
		},
		multiplayer: {
			webSocket				: hasWebSocket(),
			webRtc					: hasWebRtc(),
		},
		input: {
			domLevel3				: hasDomLevel3(),
			touch					: hasTouch(),
			gamepad					: hasGamepad(),
			motion					: hasMotion(),
			pointer					: hasPointer(),
			keyboard				: hasKeyboard()
		}
	};

	return {
		getCategories	: getCategories,
		getFeatures		: getFeatures,
		getHierarchy	: getHierarchy,
		hasFeature		: hasFeature,
		hasFeatures		: hasFeatures
	};

});

