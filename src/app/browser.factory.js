'use strict';

/**
 * @ngdoc service
 * @name browser
 * @description
 * Identify web browsers
 */
angular.module('app').factory('browser', function(){

	/**
	 * browser parser
	 * @var {Object}
	 */
	var parser = new UAParser();

	/**
	 * determine if this is a development browser
	 *
	 * @param {Object} currentBrowser
	 * @return {Boolean}
	 */
	function isDevelopmentBrowser(currentBrowser){

		var key = currentBrowser.browser.name.toLowerCase();

		if (/(firefox|chrome|opera|safari)/i.test(key)){

			if (currentBrowser.browser.latestVersion){

				var currentVersion = parseInt(currentBrowser.browser.version.replace(/^(\d+).*$/, '$1'));

				if (currentVersion >= currentBrowser.browser.latestVersion){
					return true;
				}

			}

		}

		return false;

	}

	/**
	 * determine if this is the latest browser (only popular browsers are tested)
	 *
	 * @param {Object} currentBrowser
	 * @return {Boolean}
	 */
	function isLatestBrowser(currentBrowser){

		var key = currentBrowser.browser.name.toLowerCase();

		if (/(firefox|chrome|opera|safari)/i.test(key)){

			if (currentBrowser.browser.latestVersion){

				var currentVersion = parseInt(currentBrowser.browser.version.replace(/^(\d+).*$/, '$1'));
				var stableVersion = parseInt(currentBrowser.browser.stableVersion.replace(/^(\d+).*$/, '$1'));

				if (currentVersion >= stableVersion){
					return true;
				}

			}

		}

		return false;

	}

	/**
	 * get browser icon url
	 *
	 * @param {Object} currentBrowser
	 * @return {String}
	 */
	function getIcon(currentBrowser){

		var stableBrowsers = ['adblock', 'airweb', 'android-webview-beta', 'android', 'avant', 'boat', 'brave', 'chrome-android', 'chrome-beta-android', 'chrome-dev-android', 'chrome', 'cm', 'coast', 'coc-coc', 'diigo', 'dolphin', 'dooble', 'edge', 'epic', 'firefox-beta', 'firefox-developer-edition', 'firefox', 'icab-mobile', 'icecat', 'iceweasel', 'internet-explorer-tile', 'internet-explorer', 'k-meleon', 'konqueror', 'lightning', 'link-bubble', 'mercury', 'midori', 'mihtool', 'netsurf', 'omniweb-test-build', 'omniweb', 'opera-beta', 'opera-mini-beta', 'opera-mini', 'opera', 'orbitum', 'pale-moon', 'puffin', 'qupzilla', 'rekong', 'roccat', 'safari-ios', 'safari', 'seamonkey', 'silk', 'sleipnir-mac', 'sleipnir-mobile', 'sleipnir-windows', 'sogou-mobile', 'tor', 'uc', 'vivaldi', 'waterfox', 'web', 'yandex'];

		var unstableBrowsers = {
			firefox	: 'firefox-nightly',
			chrome	: 'chrome-canary',
			opera	: 'opera-developer',
			safari	: 'webkit-nightly'
		};

		var key = currentBrowser.browser.name.toLowerCase();
		var iconIndex = _.indexOf(stableBrowsers, key);
		var iconKey = stableBrowsers[iconIndex] || null;

		if (iconKey){

			if (currentBrowser.browser.development){
				iconKey = unstableBrowsers[iconKey];
			}

			return '/assets/img/browsers/' + iconKey + '_256x256.png';

		}

		return null;

	}

	/**
	 * get the stable browser version (for known browsers)
	 *
	 * @param {String} key
	 * @return {String}
	 */
	function getStableBrowserVersion(key){
		key = key.toLowerCase();
		var version = null;
		if ('browserVersions' in window){
			if (window.browserVersions[key]){
				version = window.browserVersions[key].stable;
			}
		}
		return version;
	}

	/**
	 * get the latest browser version (for known browsers)
	 *
	 * @param {String} key
	 * @return {String}
	 */
	function getLatestBrowserVersion(key){
		key = key.toLowerCase();
		var version = null;
		if ('browserVersions' in window){
			if (window.browserVersions[key]){
				version = window.browserVersions[key].latest;
			}
		}
		return version;
	}

	/**
	 * get the current browser (and supporting data)
	 *
	 * @param {Void}
	 * @return {Object}
	 */
	function getCurrentBrowser(){

		var result = parser.getResult();

		// use external browser version data
		result.browser.stableVersion = undefined;
		var key = result.browser.name.toLowerCase();
		if ('browserVersions' in window){
			if (window.browserVersions[key]){
				result.browser.stableVersion = window.browserVersions[key].stable;
				result.browser.latestVersion = window.browserVersions[key].latest;
			}
		}

		// development browser test
		result.browser.development = isDevelopmentBrowser(result);

		// useful browser assets/urls
		// @todo: add download url
		// @todo: add homepage url
		result.browser.urls = {
			download	: undefined,
			homepage	: undefined,
			icon		: getIcon(result)
		};

		return result;

	}

	var browsers = [

		{
			name: 'Google Chrome',
			slug: 'chrome',
			icon: '/assets/img/browsers/chrome_256x256.png',
			development: false,
			url: 'https://www.google.com/chrome/browser/desktop/index.html',
			stableVersion: getStableBrowserVersion('chrome'),
			latestVersion: getLatestBrowserVersion('chrome'),
			supportedFeatures: {
				optimizedJavaScript	: true,
				asm					: true,
				webAssembly			: false,
				sharedArrayBuffer	: false,
				simd				: false,
				canvas				: true,
				webGl				: true,
				webGl2				: false,
				webAudio			: true,
				fullscreen			: true,
				pointerLock			: true,
				indexedDb			: true,
				serviceWorker		: true,
				webSocket			: true,
				webRtc				: true,
				domLevel3			: true,
				touch				: true,
				gamepad				: true
			},
			mobile: false
		},

		{
			name: 'Microsoft Edge',
			slug: 'edge',
			icon: '/assets/img/browsers/edge_256x256.png',
			development: false,
			url: 'https://www.microsoft.com/en-us/download/details.aspx?id=48126',
			stableVersion: getStableBrowserVersion('edge'),
			latestVersion: getLatestBrowserVersion('edge'),
			supportedFeatures: {
				optimizedJavaScript	: true,
				asm					: true,
				webAssembly			: false,
				sharedArrayBuffer	: false,
				simd				: false,
				canvas				: true,
				webGl				: true,
				webGl2				: false,
				webAudio			: true,
				fullscreen			: true,
				pointerLock			: true,
				indexedDb			: true,
				serviceWorker		: true,
				webSocket			: true,
				webRtc				: true,
				domLevel3			: true,
				touch				: true,
				gamepad				: true
			},
			mobile: false
		},

		{
			name: 'Mozilla Firefox',
			slug: 'firefox',
			icon: '/assets/img/browsers/firefox_256x256.png',
			development: false,
			url: 'https://www.mozilla.org/en-US/firefox/new/',
			stableVersion: getStableBrowserVersion('firefox'),
			latestVersion: getLatestBrowserVersion('firefox'),
			supportedFeatures: {
				optimizedJavaScript	: true,
				asm					: true,
				webAssembly			: false,
				sharedArrayBuffer	: false,
				simd				: false,
				canvas				: true,
				webGl				: true,
				webGl2				: false,
				webAudio			: true,
				fullscreen			: true,
				pointerLock			: true,
				indexedDb			: true,
				serviceWorker		: true,
				webSocket			: true,
				webRtc				: true,
				domLevel3			: true,
				touch				: false,
				gamepad				: true
			},
			mobile: false
		},

		{
			name: 'Apple Safari',
			slug: 'safari',
			icon: '/assets/img/browsers/safari_256x256.png',
			development: false,
			url: 'https://support.apple.com/en-us/HT204416',
			stableVersion: getStableBrowserVersion('safari'),
			latestVersion: getLatestBrowserVersion('safari'),
			supportedFeatures: {
				optimizedJavaScript	: true,
				asm					: true,
				webAssembly			: false,
				sharedArrayBuffer	: false,
				simd				: false,
				canvas				: true,
				webGl				: true,
				webGl2				: false,
				webAudio			: true,
				fullscreen			: true,
				pointerLock			: false,
				indexedDb			: true,
				serviceWorker		: false,
				webSocket			: true,
				webRtc				: false,
				domLevel3			: true,
				touch				: false,
				gamepad				: false
			},
			mobile: false
		},

		{
			name: 'Webkit Nightly',
			slug: 'webkit',
			icon: '/assets/img/browsers/webkit-nightly_256x256.png',
			development: true,
			url: 'https://nightly.webkit.org/',
			stableVersion: getLatestBrowserVersion('safari'),
			latestVersion: getLatestBrowserVersion('safari'),
			supportedFeatures: {
				optimizedJavaScript	: true,
				asm					: true,
				webAssembly			: false,
				sharedArrayBuffer	: false,
				simd				: false,
				canvas				: true,
				webGl				: true,
				webGl2				: false,
				webAudio			: true,
				fullscreen			: true,
				pointerLock			: false,
				indexedDb			: true,
				serviceWorker		: false,
				webSocket			: true,
				webRtc				: true,
				domLevel3			: true,
				touch				: false,
				gamepad				: true
			},
			mobile: false
		},

		{
			name: 'Google Chrome Canary',
			slug: 'chrome',
			icon: '/assets/img/browsers/chrome-canary_256x256.png',
			development: true,
			url: 'https://www.google.com/chrome/browser/canary.html',
			stableVersion: getLatestBrowserVersion('chrome'),
			latestVersion: getLatestBrowserVersion('chrome'),
			supportedFeatures: {
				optimizedJavaScript	: true,
				asm					: true,
				webAssembly			: false,
				sharedArrayBuffer	: false,
				simd				: false,
				canvas				: true,
				webGl				: true,
				webGl2				: false,
				webAudio			: true,
				fullscreen			: true,
				pointerLock			: true,
				indexedDb			: true,
				serviceWorker		: true,
				webSocket			: true,
				webRtc				: true,
				domLevel3			: true,
				touch				: true,
				gamepad				: true
			},
			mobile: false
		},

		{
			name: 'Mozilla Firefox Nightly',
			slug: 'firefox',
			icon: '/assets/img/browsers/firefox-nightly_256x256.png',
			development: true,
			url: 'https://nightly.mozilla.org/',
			stableVersion: getLatestBrowserVersion('firefox'),
			latestVersion: getLatestBrowserVersion('firefox'),
			supportedFeatures: {
				optimizedJavaScript	: true,
				asm					: true,
				webAssembly			: true,
				sharedArrayBuffer	: true,
				simd				: true,
				canvas				: true,
				webGl				: true,
				webGl2				: true,
				webAudio			: true,
				fullscreen			: true,
				pointerLock			: true,
				indexedDb			: true,
				serviceWorker		: true,
				webSocket			: true,
				webRtc				: true,
				domLevel3			: true,
				touch				: false,
				gamepad				: true
			},
			mobile: false
		},

	];

	function getBrowsers(){
		return browsers;
	}

	return {
		getCurrentBrowser	: getCurrentBrowser,
		getBrowsers			: getBrowsers
	};

});

