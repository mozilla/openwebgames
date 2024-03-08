'use strict';

/**
 * @ngdoc overview
 * @name app
 * @requires ngSanitize
 * @requires ui.router
 * @description
 * AngularJS application for openwebgames.com.
 */
angular.module('app', ['ngSanitize', 'ngAnimate', 'ui.router', 'hj.gsapifyRouter']);

'use strict';

/**
 * @ngdoc directive
 * @name a
 * @description
 * Intercept anchor tag href requests and properly support "anchor" links in page
 */
angular.module('app').directive('a', ["$anchorScroll", function($anchorScroll){
	return {
		restrict: 'E',
		link: function(scope, elem, attr){
			if (attr.href && attr.href.match(/#[^\/]/)){
				$(elem).on('click', function(e){
					e.preventDefault();
					$anchorScroll(attr.href.substr(1));
				});
			}
		}
	};
}]);


'use strict';

angular.module('app').config(["$stateProvider", function config($stateProvider){
	var transition = {
		duration: 0.4,
		ease: 'Quart.easeInOut',
		css: {}
	};

	var transitionEnter = function($state) {
		var enterTransition = _.cloneDeep(transition);

		switch ($state.transitionDirection) {
			case 'up':
				enterTransition.css.y = '-100%';
			break;
			case 'down':
				enterTransition.css.y = '100%';
			break;
			case 'left':
				enterTransition.css.x = '-100%';
			break;
			case 'right':
				enterTransition.css.x = '100%';
			break;
		}

		return {
			transition: enterTransition
		};
	};

	var transitionLeave = function($state) {
		var leaveTransition = _.cloneDeep(transition);

		switch ($state.transitionDirection) {
			case 'up':
				leaveTransition.css.y = '100%';
			break;
			case 'down':
				leaveTransition.css.y = '-100%';
			break;
			case 'left':
				leaveTransition.css.x = '100%';
			break;
			case 'right':
				leaveTransition.css.x = '-100%';
			break;
		}

		return {
			transition: leaveTransition
		};
	};

	var pageTransitions = {
		enter: {
			in: ['$state', transitionEnter],
			out: ['$state', transitionEnter]
		},
		leave: {
			out: ['$state', transitionLeave],
			in: ['$state', transitionLeave]
		}
	};

	$stateProvider
		.state('app', {
			views: {
				'content': {
					templateUrl: 'home.html'
				}
			}
		})
		.state('app.page', {
			url: '/:slug.html',
			views: {
				'content@': {
					templateProvider: ["$stateParams", "$templateCache", function($stateParams, $templateCache){

						// what we hope for
						var html = $templateCache.get($stateParams.slug + '.html');

						// what we settle for
						if (!html){
							html = $templateCache.get('unknown.html');
						}

						// moment of truth
						return html;

					}]
				}
			},
			data: {
				'gsapifyRouter.content': pageTransitions
			}
		})
		.state('app.unknown', {
			url: '*path',
			views: {
				'content@': {

					controller: ["$state", "$stateParams", "$templateCache", function($state, $stateParams, $templateCache){

						// clean up page slug
						var slug = $state.params.path.replace(/^\//, '').trim();

						if ($state.params.path === ''){

							// default page
							$state.go('app.page', {slug: 'home'});

						} else {

							// if just missing extension, be forgiving
							if ($templateCache.get(slug + '.html')){
								$state.go('app.page', {slug: slug});
							}

						}
					}],

					// last resort
					templateUrl: 'unknown.html'

				}
			}
		});
}]);

'use strict';

/**
 * @ngdoc directive
 * @name blurrable
 * @description
 * Defines page content elements that should be blurred during modal events
 */
angular.module('app').directive('blurrable', ["$rootScope", function($rootScope){
	return {
		restrict: 'A',
		link: function(scope, elem, attr){

			if (!$rootScope.blurrables){

				function getBlurClass(){
					var isBlurrable = true;
					if (scope.isMobile){
						isBlurrable = false;
					} else if (scope.currentBrowser){
						if (/edge/i.test(scope.currentBrowser.engine.name)){
							isBlurrable = false;
						}
					}
					return isBlurrable ? 'blur' : 'blur-fallback';
				}

				function addBlur(key){
					if ($rootScope.blurrables[key]){
						_.each($rootScope.blurrables[key].elements, function(el){
							el.addClass(getBlurClass());
						});
						$rootScope.blurrables[key].blurred = true;
					}
				}

				function removeBlur(key){
					if ($rootScope.blurrables[key]){
						_.each($rootScope.blurrables[key].elements, function(el){
							el.removeClass(getBlurClass());
						});
						$rootScope.blurrables[key].blurred = false;
					}
				}

				$rootScope.blurrables = {};

				$rootScope.blur = function(key){
					addBlur(key || 'default');
				};

				$rootScope.unblur = function(key){
					removeBlur(key || 'default');
				};

				$rootScope.blurred = function(key){
					return ($rootScope.blurrables[key || 'default'].blurred);
				};

			}

			var key = attr.blurrable || 'default';

			if (!$rootScope.blurrables[key]){
				$rootScope.blurrables[key] = {
					blurred: false,
					elements: []
				};
			}

			$rootScope.blurrables[key].elements.push(elem);

		}
	};
}]);


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


'use strict';

/**
 * @ngdoc filter
 * @name byActiveDemoGame
 * @description
 * Get active demo-friendly games.
 */
angular.module('app').filter('byActiveDemoGame', function(){
	return function(games, currentBrowser){
		var results = {};
		_.each(games, function(game, key){
			if (game.desktopDemo || game.mobileDemo){
				if (!currentBrowser){
					results[key] = game;
				}
				var isMobile = currentBrowser && (currentBrowser.device.type === 'mobile');
				if (isMobile && game.mobileDemo || !isMobile && game.desktopDemo){
					results[key] = game;
				}
			}
		});
		return results;
	};
});


'use strict';

/**
 * @ngdoc filter
 * @name byActiveGame
 * @description
 * Get active games.
 */
angular.module('app').filter('byActiveGame', function(){
	return function(games, currentBrowser){
		var results = {};
		_.each(games, function(game, key){
			if (game.desktopTest || game.mobileTest){
				if (!currentBrowser){
					results[key] = game;
				}
				var isMobile = currentBrowser && (currentBrowser.device.type === 'mobile');
				if (isMobile && game.mobileTest || !isMobile && game.desktopTest){
					results[key] = game;
				}
			}
		});
		return results;
	};
});


'use strict';

/**
 * @ngdoc filter
 * @name byCustomBrowserOrder
 * @description
 * Get recommended browsers via a custom (client-defined) order.
 */
angular.module('app').filter('byCustomBrowserOrder', function(){
	return function(browsers){
		var split = _.partition(browsers, function(browser){
			return !browser.development;
		});
		split[0] = _.shuffle(split[0]);
		split[1] = _.shuffle(split[1]);
		return _.flatten(split);
	};
});



'use strict';

/**
 * @ngdoc filter
 * @name byCustomResourceOrder
 * @description
 * Get developer resources via a custom (client-defined) order.
 */
angular.module('app').filter('byCustomResourceOrder', function(){
	return function(resources){
		var split = _.partition(resources, function(resource){
			return !/github\.com/i.test(resource.url);
		});
		split[0] = _.shuffle(split[0]);
		return _.flatten(split);
	};
});


'use strict';

/**
 * @ngdoc filter
 * @name byGameFolderSizeOrder
 * @description
 * Get back games ordered by folder size (smallest to largest).
 */
angular.module('app').filter('byGameFolderSizeOrder', function(){
	return function(games){

		var keys = _.keys(games);

		// remember keys
		_.each(keys, function(key){
			games[key].key = key;
		});

		// deconstruct object values
		var vals = _.values(games);

		// sort by folder size
		vals = _.sortBy(vals, function(val){
			return val.folderSize;
		});

		// re-stitch objects
		var orderedGames = {};
		_.each(vals, function(val){
			orderedGames[val.key] = val;
			delete orderedGames[val.key].key;
		});

		return orderedGames;
	};
});


'use strict';

/**
 * @ngdoc filter
 * @name byRandomGameOrder
 * @description
 * Get back games in a random order.
 */
angular.module('app').filter('byRandomGameOrder', function(){
	return function(games){

		// randomize game order
		var keys = _.shuffle(_.keys(games));
		var randomizedGames = {};
		_.each(keys, function(key){
			randomizedGames[key] = games[key];
		});

		return randomizedGames;
	};
});


'use strict';

/**
 * @ngdoc filter
 * @name byPageType
 * @description
 * Get pages by type.
 */
angular.module('app').filter('byPageType', function(){
	return function(pages, type){
		return _.filter(pages, function(page){
			return page.type && page.type === type;
		});
	};
});


'use strict';

/**
 * @ngdoc directive
 * @name capture-arrows
 * @description
 * Capture arrow key events
 */
angular.module('app').directive('captureArrows', ["$timeout", "$rootScope", "easing", "navigation", function($timeout, $rootScope, easing, navigation){
	return {
		restrict: 'C',
		scope: false,
		link: function(scope, element){

			scope.triggerArrow = function(direction){

				// temporarily add arrow direction class (css animations)
				angular.element('body').addClass('arrow-' + direction);
				$timeout(function(){
					angular.element('body').removeClass('arrow-' + direction);
				}, 250);

				// perform navigation
				navigation.navigateByDirection(direction).catch(function (error){
					if (!_.isString(error)) {
						throw error;
					}
				});

			};

			element.on('keydown', function(event){

				if (!$rootScope.blurred()){

					var direction;

					switch(event.which){
						case 37:
							direction = 'left';
							break;
						case 38:
							direction = 'up';
							break;
						case 39:
							direction = 'right';
							break;
						case 40:
							direction = 'down';
							break;
						default:
							return;
					}

					scope.triggerArrow(direction);

				}

			});

		}
	};
}]);

'use strict';

/**
 * @ngdoc directive
 * @name capture-diagnostic-key
 * @description
 * Capture diagnostic hotkey (f12)
 */
angular.module('app').directive('captureDiagnosticKey', ["$state", function($state){
	return {
		restrict: 'C',
		scope: false,
		link: function(scope, elem){

			function triggerDiagnostic(code){
				if (code === 123){
					$state.go('app.page', {slug: 'diagnostics'});
					scope.$apply();
				}
			}

			elem.on('keydown', function(e){
				triggerDiagnostic(e.which);
			});

		}
	};
}]);




'use strict';

/**
 * @ngdoc directive
 * @name capture-konami
 * @description
 * Capture konami key sequence events
 */
angular.module('app').directive('captureKonami', function(){
	return {
		restrict: 'C',
		scope: false,
		link: function(scope, elem){

			var konami = [];

			function triggerKonami(code){

				var seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
				var next = konami.length || 0;

				if (next === 10){
					if (code === 32 || code === 13){
						console.log('KONAMI!!!!');
						scope.status = 'KONAMI!!!';
						scope.$apply();
					}
					konami = [];
					return;
				}

				if (seq[next] === code){
					konami.push(code);
				}

			}

			elem.on('keydown', function(e){
				triggerKonami(e.which);
			});

		}
	};
});



'use strict';

/**
 * @ngdoc directive
 * @name capture-mouse
 * @description
 * Capture mouse events
 */
angular.module('app').directive('captureMouse', ["$timeout", function($timeout){
	return {
		restrict: 'C',
		scope: false,
		link: function(scope, elem){

			function triggerMouseMove(){
				angular.element('body').addClass('mouse-move');
				$timeout(function(){
					angular.element('body').removeClass('mouse-move');
				}, 250);
			}

			function triggerMouseClick(){
				angular.element('body').addClass('mouse-click');
				$timeout(function(){
					angular.element('body').removeClass('mouse-click');
				}, 250);
			}

			elem.on('mousemove', function(){
				triggerMouseMove();
			});

			elem.on('click', function(){
				triggerMouseClick();
			});

		}
	};
}]);


'use strict';

/**
 * @ngdoc directive
 * @name circle-grid
 * @description
 * Circle Grid (Animated Backdrop)
 */
angular.module('app').directive('circleGrid', ["$timeout", function($timeout){
	return {
		restrict: 'C',
		link: function(scope, elem){

			var minSmokeCount	= 5;
			var maxSmokeCount	= 10;
			var circleSize		= 45;
			var supportedPages	= ['faq', 'home', 'media', 'resources', 'rights', 'upgrade'];

			/**
			 * Geometry Vector library (x,y based)
			 */
			Math.Vector = function(x, y) {
				this.x = x;
				this.y = y;
			};
			Math.Vector.prototype = {
				clone: function() {
					return new Math.Vector(this.x, this.y);
				},
				negate: function() {
					this.x = -this.x;
					this.y = -this.y;
					return this;
				},
				neg: function() {
					return this.clone().negate();
				},
				addeq: function(v) {
					this.x += v.x;
					this.y += v.y;
					return this;
				},
				subeq: function(v) {
					return this.addeq(v.neg());
				},
				add: function(v) {
					return this.clone().addeq(v);
				},
				sub: function(v) {
					return this.clone().subeq(v);
				},
				multeq: function(c) {
					this.x *= c;
					this.y *= c;
					return this;
				},
				diveq: function(c) {
					this.x /= c;
					this.y /= c;
					return this;
				},
				mult: function(c) {
					return this.clone().multeq(c);
				},
				div: function(c) {
					return this.clone().diveq(c);
				},
				dot: function(v) {
					return this.x * v.x + this.y * v.y;
				},
				length: function() {
					return Math.sqrt(this.dot(this));
				},
				normal: function() {
					return this.clone().diveq(this.length());
				}
			};

			/**
			 * generate random smoke containers html
			 *
			 * @param {Void}
			 * @return {String} html
			 */
			function generateSmokeHtml(){

				var count = _.random(minSmokeCount, maxSmokeCount);
				var type = null;
				var html = '';

				for (var i = 0; i < count; i++){
					type = _.random(1, 2);
					html += '<div class="smoke' + type + '"></div>';
				}

				return html;

			}

			/**
			 * generate container elements
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function generateContainers(){

				// create random smoke elements
				var smokeHtml = generateSmokeHtml();

				// create master container(s)
				var container = $('<div class="grid-container">' + smokeHtml + '<div class="circle-container"></div></div>');

				// prepend to directive container
				$(elem).prepend(container);

			}

			/**
			 * randomize smoke positions
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function randomizeSmokePosition(){

				var selector		= $(elem).find('.smoke1,.smoke2'),
					width 			= $(window).width(),
					height 			= document.body.scrollHeight,
					minPixelShift 	= -100;

				selector.each(function(){
					$(this).css({
						marginTop	: _.random(minPixelShift, height),
						marginLeft	: _.random(minPixelShift, width)
					});
				});

			}

			/**
			 * generate circle elements
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function generateCircles(){

				var width 	= $(window).width(),
					height 	= document.body.scrollHeight,
					columns	= Math.floor(width / circleSize),
					rows	= Math.floor(height / circleSize),
					count 	= columns * rows;

				for (var i = 0; i < count; i++){
					$( '.circle-container' ).append('<div class="circle-outer"><div class="circle-inner"></div></div>');
				}

			}

			/**
			 * teach an element to evade mouse focus
			 *
			 * @param {DOMEvent}
			 * @return {Void}
			 */
			function evade(evt) {

				var $this = $(this),
					corner = $this.offset(),
					center = {
						x: corner.left + $this.outerWidth() / 2,
						y: corner.top + $this.outerHeight() / 2
					},
					dist = new Math.Vector(center.x - evt.pageX, center.y - evt.pageY),
					closest = $this.outerWidth() / 2;

				// proximity test
				if (dist.length() >= closest) {
					return;
				}

				// calculate new position
				var delta = dist.normal().multeq(closest).sub(dist),
					newCorner = {
						left: corner.left + delta.x,
						top: corner.top + delta.y
					};

				// bounds check
				var padding = parseInt($this.css('padding-left'));
				if (newCorner.left < -padding) {
					newCorner.left = -padding;
				} else if (newCorner.left + $this.outerWidth() - padding > $(document).width()) {
					newCorner.left = $(document).width() - $this.outerWidth() + padding;
				}
				if (newCorner.top < -padding) {
					newCorner.top = -padding;
				} else if (newCorner.top + $this.outerHeight() - padding > $(document).height()) {
					newCorner.top = $(document).height() - $this.outerHeight() + padding;
				}

				// move bumper
				$this.css('opacity', 0.25);
				$this.offset(newCorner);
			}

			/**
			 * bind mouse movement to evade
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function beginEvade() {
				$(this).bind('mousemove', evade);
			}

			/**
			 * unbind mousemove from evade and animate bumper back to original spot
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function endEvade() {
				var $this = $(this);
				$this.unbind('mousemove', evade);
				$this.animate({
					top		: 0,
					left	: 0,
					opacity	: 0.07
				}, {
					easing: 'swing',
					duration: 500
				});
			}

			/**
			 * setup evade events for each circle
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function setupEvadeEvents() {
				$('.circle-outer').bind('mouseover', beginEvade);
				$('.circle-outer').bind('mouseout', endEvade);
			}

			/**
			 * kill the background animations
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function destroy(){
				$('.grid-container').remove();
			}

			/**
			 * initialize the background animations
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function initialize(){
				generateContainers();
				generateCircles();
				randomizeSmokePosition();
				setupEvadeEvents();
			}

			/**
			 * re-initialize the background animations
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function reInitialize(){
				destroy();
				initialize();
			}

			/**
			 * determine if a page has support for this animation experience
			 *
			 * @param {String} pagekey
			 * @return {Boolean}
			 */
			function pageHasSupport(pagekey){
				return _.includes(supportedPages, pagekey);
			}

			// execute between digest cycles
			$timeout(function(){

				if (scope.isMobile === false){

					// not on this page
					if (!pageHasSupport(scope.stateParams.slug)){
						return destroy();
					}

					// first time!
					initialize();

					scope.$on('$stateChangeSuccess', function(event, toState, toParams){

						// not on this page
						if (!pageHasSupport(toParams.slug)){
							return destroy();
						}

						// been here before, and ready to do it again
						reInitialize();

					});

					$(window).resize(function(){
						destroy();
						if (pageHasSupport(scope.stateParams.slug)){
							initialize();
						}
					});

				}

			});

		}
	};
}]);


'use strict';

/**
 * @ngdoc directive
 * @name d3-charts
 * @description
 * Generates data visualization charts using D3.js.
 */
angular.module('app').directive('chartType', function(){
	return {
		restrict: 'A',
		require: ['?chartData', '?unitWidth', '?unitHeight', '?unitMargin'],
		link: function(scope, elem, attr){

			// always use a uniqueid
			if (!elem.attr('id')){
				elem.attr('id', _.uniqueId('d3-'));
			}

			// basic options
			var type		= attr.chartType;
			var data		= attr.chartData;
			var unitWidth	= attr.unitWidth || 10;
			var unitHeight	= attr.unitHeight || unitWidth;
			var unitMargin	= attr.unitMargin || 1;

			/**
			 * generate a simple bar chart
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			var barChart = function(){

				// svg container
				var w = unitWidth * _.max(data);
				var h = (unitHeight * data.length) + (unitMargin * (data.length - 1));
				var svg = el.append('svg')
					.attr({
						'preserveAspectRatio': 'none',
						'shape-rendering': 'crispEdges',
						'width': w,
						'height': h,
						'viewBox': function(){
							return '0 0 ' + w + ' ' + h;
						}
					})
					.style({
						'width': '100%',
						'height': '100%'
					});

				// rectangles
				var rectangles = [];
				_.each(data, function(d, i){
					rectangles.push({
						x: 0,
						y: (i * unitHeight) + (i * unitMargin),
						width: d * unitWidth,
						height: unitHeight
					});
				});

				// draw
				svg.selectAll('rect')
					.data(rectangles)
					.enter()
					.append('rect')
					.attr({
						x: function(d){ return d.x; },
						y: function(d){ return d.y; },
						width: function(d){ return d.width; },
						height: function(d){ return d.height; }
					});
			};

			/**
			 * generate a circle chart (experimental)
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			var circleChart = function(){

				// container dimensions
				var w = 0;
				var h = 0;

				// circles
				var circles = [];
				_.each(data, function(d, i){
					var prev = (i > 0) ? (circles[i - 1].cy + circles[i - 1].r) : 0;
					circles.push({
						cx: d * unitWidth,
						cy: d * unitWidth + prev,
						r: d * unitWidth
					});
					w = _.max([w, (d * unitWidth * 2)]);
					h = d * unitWidth + prev + (d * unitWidth);
				});

				// svg container
				var svg = el.append('svg')
					.attr({
						'preserveAspectRatio': 'none',
						//'shape-rendering': 'crispEdges',
						'width': w,
						'height': h,
						'viewBox': function(){
							return '0 0 ' + w + ' ' + h;
						}
					})
					.style({
						'width': '100%',
						'height': '100%'
					});

				// draw
				svg.selectAll('circle')
					.data(circles)
					.enter()
					.append('circle')
					.attr({
						cx: function(d){ return d.cx; },
						cy: function(d){ return d.cy; },
						r: function(d){ return d.r; }
					});
			};

			// make it happen cap'n
			if (type && data){

				// self
				var el = d3.select('#' + elem.attr('id'));

				// @todo: support external json files
				// @todo: validate data
				data = JSON.parse(data);

				switch(type){

					// bar chart
					case 'bar':
						barChart();
						break;

					// circle chart
					case 'circle':
						circleChart();
						break;

				}
			}
		}
	};
});


'use strict';

/**
 * @ngdoc service
 * @name developer-resource
 * @description
 * Identify developer resources
 */
angular.module('app').factory('developerResource', function(){

	var resources = [
		{
			name: 'Mozilla Developer Network',
			icon: '/assets/img/resources/mdn.png',
			url: 'https://developer.mozilla.org/'
		},
		{
			name: 'Microsoft Developer Network',
			icon: '/assets/img/resources/msdn.png',
			url: 'https://insider.windows.com/'
		},
		{
			name: 'Google Developer Network',
			icon: '/assets/img/resources/chromium.png',
			url: 'https://developers.google.com/games/'
		},
	];

	function getResources(){
		return resources;
	}

	return {
		getResources : getResources
	};

});


'use strict';

/**
 * @ngdoc directive
 * @name developer-resource-listing
 * @description
 * List developer resources
 */
angular.module('app').directive('developerResourceListing', ["$filter", "developerResource", function($filter, developerResource){
	return {
		restrict: 'C',
		link: function(scope){
			var byCustomResourceOrder = $filter('byCustomResourceOrder');
			scope.resources = byCustomResourceOrder(developerResource.getResources());
		}
	};
}]);


'use strict';

/**
 * @ngdoc directive
 * @name diagnostic-chart
 * @description
 * Output a diagnostic chart outlining information about the current browser.
 */
angular.module('app').directive('diagnosticChart', ["$compile", function($compile){
	return {
		restrict: 'C',
		link: function(scope, elem){

			// current browser
			console.log(scope.currentBrowser);

			// generete template
			var html = '<img style="float: right; max-width:60px;" src="' + scope.currentBrowser.browser.urls.icon + '"/>';
			html += '<p>' + scope.currentBrowser.ua + '</p>';
			html += '<table class="table table-compact">';

			// browser
			html += '<tr><th colspan="2">BROWSER</th></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;browser name</td><td>' + scope.currentBrowser.browser.name + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;browser major</td><td>' + scope.currentBrowser.browser.major + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;browser version</td><td>' + scope.currentBrowser.browser.version + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;browser stable</td><td>' + scope.currentBrowser.browser.stableVersion + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;browser latest</td><td>' + scope.currentBrowser.browser.latestVersion + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;latest</td><td>' + scope.currentBrowser.browser.latest + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;development</td><td>' + scope.currentBrowser.browser.development + '</td></tr>';

			// engine
			html += '<tr><th colspan="2">ENGINE</th></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;name</td><td>' + scope.currentBrowser.engine.name + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;version</td><td>' + scope.currentBrowser.engine.version + '</td></tr>';

			// os
			html += '<tr><th colspan="2">OS</th></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;name</td><td>' + scope.currentBrowser.os.name + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;version</td><td>' + scope.currentBrowser.os.version + '</td></tr>';

			// separator
			//html += '<tr><td colspan="2">&nbsp;</td></tr>';

			// cpu
			html += '<tr><th colspan="2">CPU</th></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;architecture</td><td>' + scope.currentBrowser.cpu.architecture + '</td></tr>';

			// device
			html += '<tr><th colspan="2">DEVICE</th></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;model</td><td>' + scope.currentBrowser.device.model + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;type</td><td>' + scope.currentBrowser.device.type + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;vendor</td><td>' + scope.currentBrowser.device.vendor + '</td></tr>';

			// separator
			//html += '<tr><td colspan="2">&nbsp;</td></tr>';

			html += '<tr><th colspan="2">FEATURES</th></tr>';

			// feature hierarchy
			_.each(scope.currentBrowser.browser.features, function(category, categoryKey){
				html += '<tr><th colspan="2">' + categoryKey.toUpperCase() + ' SUPPORT</th></tr>';
				_.each(category, function(feature, featureKey){
					html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;' + featureKey + '</td><td>' + feature + '</td></tr>';
				});
			});

			html += '</table>';

			// show template
			elem.html(html).show();

			// link the scope to template
			$compile(elem.contents())(scope);
		}
	};
}]);


'use strict';

/**
 * @ngdoc service
 * @name easing
 * @description
 * Easing equations
 */
angular.module('app').factory('easing', function(){

	function easeInQuad(t, b, c, d){
		return c*(t/=d)*t + b;
	}

	return {
		easeInQuad : easeInQuad
	};

});


'use strict';

/**
 * @ngdoc directive
 * @name view-faq
 * @description
 * View directive
 */
angular.module('app').directive('viewFaq', ["$timeout", "$document", "$rootScope", function($timeout, $document, $rootScope){
	return {
		restrict: 'C',
		scope: true,
		link: function(scope, element){

			// @TODO: Temporary mobile check
			if(element.width() < 1099) {
				return;
			}

			$timeout(function(){
				$rootScope.onLeftScroll = function(){ slider.slick('slickPrev'); };
				$rootScope.onRightScroll = function(){ slider.slick('slickNext'); };
			});

			var slides;

			var slider = element.find('.js-slick').slick({
				centerMode: true,
				infinite: false,
				initialSlide: 0,
				variableWidth: true,
				nextArrow: '<div class="nav-arrow nav-right slick-next"><button class="nav-button"></button></div>',
				prevArrow: '<div class="nav-arrow nav-left slick-prev"><button class="nav-button"></button></div>'
			});

			$timeout(function(){
				setSlides();
				styleSlides(0);

				$document.on('keydown', onKeyboard);
			});

			slider.on('beforeChange', function(event, slick, currenSlide, nextSlide){
				styleSlides(nextSlide);
			});

			function onKeyboard(event){
				if (!$rootScope.blurred()){
					switch(event.which){
						case 37:
							slider.slick('slickPrev');
							break;
						case 39:
							slider.slick('slickNext');
							break;
						default:
							return;
					}
				}
			}

			function setSlides() {
				slides = element.find('.slick-slide').toArray()
				.reduce(function(accumulator, slide){
					slide = $(slide);
					accumulator[slide.data('slick-index')] = slide;

					return accumulator;
				}, {});
			}

			function styleSlides(centerIndex){
				_.forEach(slides, function(slide, key){

					if (key === centerIndex - 1 || key === centerIndex + 1) {
						slide.addClass('secondary');
						slide.removeClass('tertiary');
					} else if (key === centerIndex - 2 || key === centerIndex + 2) {
						slide.addClass('tertiary');
						slide.removeClass('secondary');
					} else {
						slide.removeClass('secondary');
						slide.removeClass('tertiary');
					}
				});
			}

			element.on('$destroy', function() {
				$document.off('keydown', onKeyboard);
				$rootScope.onLeftScroll = null;
				$rootScope.onRightScroll = null;
			});
		}
	};
}]);

'use strict';

/**
 * @ngdoc directive
 * @name features
 * @description
 * View directive
 */
angular.module('app').directive('viewFeatures', ["$filter", "$state", "$timeout", "browser", "game", "gameSupport", function($filter, $state, $timeout, browser, game, gameSupport){
	return {
		restrict: 'C',
		link: function(scope, elem){
			if (!scope.selectedTab) {

				scope.selectedTab = 'games';

				// @todo: build logic for these and re-enable them, styling is
				// already done
				scope.enableFilters = false;
				scope.enableSearch = false;

				// filters
				var byCustomBrowserOrder = $filter('byCustomBrowserOrder');
				var byActiveGame = $filter('byActiveGame');
				var byGameFolderSizeOrder = $filter('byGameFolderSizeOrder');

				// browsers
				scope.browsers = byCustomBrowserOrder(browser.getBrowsers());

				// games
				scope.games = byActiveGame(game.getGames(), scope.currentBrowser);
				scope.games = byGameFolderSizeOrder(scope.games);

				scope.getCurrentBrowserFeatureClass = function(feature){
					if (gameSupport.hasFeature(feature)){
						return 'supported';
					} else {
						return 'not-supported';
					}
				};

				scope.getGameFeatureClass = function(key, feature){
					var result = 'not-in-use';
					_.each(scope.games, function(game, gameKey){
						if (gameKey === key){
							if (_.includes(game.features, feature)){
								result = 'in-use';
							}
						}
					});
					return result;
				};

				scope.getBrowserFeatureClass = function(browser, feature){
					if (/edge/i.test(browser.name) && feature === 'webRtc'){
						// @todo: improve webrtc test and remove this
						return 'not-supported';
					}
					return (browser.supportedFeatures[feature]) ? 'supported' : 'not-supported';
				};

				scope.getResultClass = function(key){
					var results = scope.$parent.results;

					if (!results) {
						return 'test-failed';
					}

					var game = results[key];

					if (!game) {
						return 'test-failed';
					}

					if (game.error) {
						if (game.error.message === 'Game timed out') {
							return 'test-timeout';
						}

						return 'test-failed';
					}

					if (!game.status || game.status.length === 0 || !game.results) {
						return 'test-failed';
					}

					return 'test-' + game.status;
				};

				scope.getFps = function(key){
					var results = scope.$parent.results;

					if (!results) {
						return 0;
					}

					var game = results[key];

					if (!game || !game.results || isNaN(game.results.fps)) {
						return 0;
					}

					return Math.floor(game.results.fps);
				};

				scope.getTotalTime = function(key){
					var results = scope.$parent.results;

					if (!results) {
						return 0;
					}

					var game = results[key];

					if (!game || !game.results || isNaN(game.results.totalTime)) {
						return 0;
					}

					var totalTime = Math.floor(game.results.totalTime);
					var minutes = totalTime / 1000 / 60;
					var seconds = Math.floor(minutes % 1 * 60).toString();

					return Math.floor(minutes) + ':' + (seconds.length === 1 ? '0' + seconds : seconds);
				};

				scope.getFramesDropped = function(key){
					var value = 0;
					if (scope.$parent.results){
						var game = scope.$parent.results[key];
						if (game && game.results && !isNaN(game.results.numStutterEvents)) {
							value = Math.floor(game.results.numStutterEvents);
						}
					}
					return value;
				};
			}

			scope.rerunTest = function(){
				scope.$parent.testState = 'intro';
				$state.go('app.page', {slug: 'tests'});
			};

			var highlightRow = elem.find('.highlight-row');
			var showRow = TweenMax.to(highlightRow, 0.5, {
				paused: true,
				ease: 'Cubic.easeInOut',
				css: {
					opacity: 0.15
				}
			});

			var highlightColumn = elem.find('.highlight-column');
			var showColumn = TweenMax.to(highlightColumn, 0.5, {
				paused: true,
				ease: 'Cubic.easeInOut',
				css: {
					opacity: 0.15
				}
			});

			function positionRow(y){
				TweenMax.to(highlightRow, 0.3, {
					ease: 'Quint.easeOut',
					css: {
						y: y
					}
				});
			}

			function positionColumn(x){
				TweenMax.to(highlightColumn, 0.3, {
					ease: 'Quint.easeOut',
					css: {
						x: x
					}
				});
			}

			function showDefinitions(){
				$('div.msg-results').addClass('show-definitions');
			};

			function hideDefinitions(){
				$('div.msg-results').removeClass('show-definitions');
			};

			$timeout(function(){
				elem.find('.feature-set').toArray().forEach(function(element){
					var $element = $(element);

					$element.on('mouseover', function(){
						positionRow(parseInt($element.css('margin-top').replace('px', '')) + $element.position().top + $element.height() * 0.5);
						showRow.play();
					});

					$element.on('mouseout', function(){
						showRow.reverse();
					});
				});

				var yourBrowser = elem.find('.feature-set.your-browser')[0];

				// position test button position based on games being tested
				var gameCount = elem.find('.game').length;

				var resultsButton = $('.show-test-results .msg-results .btn');
				resultsButton.css({marginTop: 54 + (gameCount * 90)});

				elem.find('.feature-set .js-column').toArray().forEach(function(element){
					var $element = $(element);

					$element.on('mouseover', function(){
						var position;

						if ($.contains(yourBrowser, element)) {
							position = $element.position().left + $element.width();
						} else {
							position = $element.position().left + $element.width() * 0.5;
						}

						positionColumn(position);
						showColumn.play();
					});

					$element.on('mouseout', function(){
						showColumn.reverse();
					});
				});

				elem.find('.header li:not(.section-title)').toArray().forEach(function(element){
					var $element = $(element);

					$element.on('mouseover', function(){
						positionColumn(($element.parent().position().left + $element.position().left + $element.width() * 0.4) * 0.995);
						showColumn.play();
					});

					$element.on('mouseout', function(){
						showColumn.reverse();
					});
				});

				elem.find('.your-browser').toArray().forEach(function(element){
					var $element = $(element);
					var normalWidth = 900;

					$element.on('mouseover', function(){
						TweenMax.to(highlightRow, 0.2, {
							ease: 'Cubic.easeInOut',
							width: normalWidth
						});
					});

					$element.on('mouseout', function(){
						TweenMax.to(highlightRow, 0.2, {
							ease: 'Cubic.easeInOut',
							width: '100%'
						});
					});

				});

				// show/hide definition popover
				var testDefinitions = elem.find('svg.test-definitions');
				testDefinitions.bind('click', showDefinitions);
				testDefinitions.bind('mouseover', showDefinitions);
				testDefinitions.bind('mouseout', hideDefinitions);

				// hide mobile popover on click
				var popover = elem.find('.popover');
				popover.bind('click', hideDefinitions);

			}, 0);
		}
	};
}]);

'use strict';

/**
 * @ngdoc directive
 * @name feedback
 * @description
 * Submit feedback to API and updated feedback form
 */
angular.module('app').directive('feedback', ["$http", function($http){
	return {
		restrict: 'C',
		link: function(scope, elem){
			elem.on('submit', function(){

				var text = elem.find('textarea');
				if (!text.val()){
					return console.error('nothing to submit');
				}

				var success = function(){
					text.val('');
					scope.showConfirmation(true);
				};

				var error = function(){
					scope.showConfirmation(false);
				};

				$http.post('/feedback', {text: text.val()}).success(success).error(error);

			});
		}
	};
}]);



'use strict';

/**
 * @ngdoc service
 * @name game
 * @description
 * Identify web games
 */
angular.module('app').factory('game', function(){

	var cdnUrl = 'https://s3.amazonaws.com/owg/';
	var games = {

		sponzadynamicshadows: {
			name: 'Sponza Dynamic Shadows',
			icon: cdnUrl + 'sponza/icon.png',
			screenshot: cdnUrl + 'sponza/reference.png',
			url: cdnUrl + 'sponza/Demos/SponzaDynamicShadows/index.html',
			width: 1366,
			height: 768,
			features: [
				'webGl',
				'domLevel3'
			],
			folderSize: 78560,
			timeout: 60000,
			credits: [
				{
					category: 'WebGL JavaScript Framework',
					name: 'BabylonJS',
					url: 'http://www.babylonjs.com/'
				}
			],
			mobileTest: true,
			mobileDemo: false,
			desktopTest: true,
			desktopDemo: false,
			fullscreen: true
		},

		heroesofparagon: {
			name: 'Heroes of Paragon',
			icon: cdnUrl + 'heroesofparagon/icon.png',
			screenshot: cdnUrl + 'heroesofparagon/reference.png',
			url: cdnUrl + 'heroesofparagon/index.html',
			width: 1366,
			height: 768,
			features: [
				'optimizedJavaScript',
				'webGl',
				'webAudio',
				'indexedDb',
				'domLevel3'
			],
			folderSize: 244488,
			timeout: 120000,
			credits: [
				{
					category: 'Unity3D',
					name: 'EVERYDAYiPLAY',
					url: 'https://everydayiplay.com/'
				}
			],
			mobileTest: false,
			mobileDemo: false,
			desktopTest: true,
			desktopDemo: true,
			fullscreen: true
		},

		suntemple: {
			name: 'Sun Temple',
			icon: cdnUrl + 'suntemple/icon.jpg',
			screenshot: cdnUrl + 'suntemple/reference.png',
			url: cdnUrl + 'suntemple/index.html',
			width: 1366,
			height: 768,
			features: [
				'optimizedJavaScript',
				'webGl',
				'indexedDb',
				'domLevel3'
			],
			folderSize: 203144,
			timeout: 120000,
			credits: [
				{
					category: 'Unreal Engine 4.10',
					name: 'Sun Temple',
					url: 'https://www.unrealengine.com/'
				}
			],
			mobileTest: false,
			mobileDemo: false,
			desktopTest: true,
			desktopDemo: false,
			fullscreen: false
		},

		casino: {
			name: 'Casino',
			icon: cdnUrl + 'casino/icon.jpg',
			screenshot: cdnUrl + 'casino/reference.png',
			url: cdnUrl + 'casino/index.html',
			width: 1366,
			height: 768,
			features: [
				'webGl',
				'domLevel3'
			],
			folderSize: 157720,
			timeout: 120000,
			credits: [
				{
					category: 'PlayCanvas',
					name: 'Casino',
					url: 'https://playcanvas.com/industries/gambling'
				}
			],
			mobileTest: false,
			mobileDemo: false,
			desktopTest: true,
			desktopDemo: true,
			fullscreen: true
		},

		alphabear: {
			name: 'Alphabear',
			icon: cdnUrl + 'alphabear/icon.jpg',
			screenshot: cdnUrl + 'alphabear/reference.png',
			url: cdnUrl + 'alphabear/index.html',
			width: 1366,
			height: 768,
			features: [
				'webGl',
				'domLevel3'
			],
			folderSize: 51968,
			timeout: 120000,
			credits: [
				{
					category: 'SpryFox',
					name: 'Alphabear',
					url: 'http://spryfox.com/our-games/alphabear/'
				}
			],
			mobileTest: false,
			mobileDemo: false,
			desktopTest: true,
			desktopDemo: true,
			fullscreen: false
		},

		hurry: {
			name: 'Hurry!',
			icon: cdnUrl + 'hurry/icon.jpg',
			screenshot: cdnUrl + 'hurry/reference.png',
			url: cdnUrl + 'hurry/index.html',
			width: 1117,
			height: 768,
			features: [
				'canvas',
				'domLevel3'
			],
			folderSize: 2712,
			timeout: 120000,
			credits: [
				{
					category: 'Hugh Kennedy',
					name: 'Hurry!',
					url: 'https://github.com/hughsk/ludum-dare-27'
				}
			],
			mobileTest: true,
			mobileDemo: false,
			desktopTest: true,
			desktopDemo: false,
			fullscreen: false
		},

		skisafari: {
			name: 'Ski Safari',
			icon: cdnUrl + 'skisafari/icon.jpg',
			screenshot: cdnUrl + 'skisafari/reference.png',
			url: cdnUrl + 'skisafari/index.html',
			width: 1366,
			height: 768,
			features: [
				'webGl',
				'domLevel3'
			],
			folderSize: 96512,
			timeout: 120000,
			credits: [
				{
					category: 'Sleepy Z Studios',
					name: 'Ski Safari',
					url: 'http://skisafari2.com/'
				}
			],
			mobileTest: false,
			mobileDemo: false,
			desktopTest: true,
			desktopDemo: true,
			fullscreen: false
		},

		medusae: {
			name: 'Medusae',
			icon: cdnUrl + 'medusae/icon.jpg',
			screenshot: cdnUrl + 'medusae/reference.png',
			url: cdnUrl + 'medusae/index.html',
			width: 1366,
			height: 768,
			features: [
				'webGl'
			],
			folderSize: 9328,
			timeout: 120000,
			credits: [
				{
					category: 'Jay Weeks',
					name: 'Medusae',
					url: 'https://github.com/jpweeks/particulate-medusae'
				}
			],
			mobileTest: true,
			mobileDemo: true,
			desktopTest: true,
			desktopDemo: true,
			fullscreen: true
		},

	};

	function getGames(){
		return games;
	}

	return {
		getGames : getGames
	};

});



'use strict';

/**
 * @ngdoc service
 * @name game-browser
 * @description
 * Identify web browsers and their supported gaming features
 */
angular.module('app').factory('gameBrowser', ["browser", "gameSupport", function(browser, gameSupport){

	function getCurrentBrowser(){

		var currentBrowser = browser.getCurrentBrowser();
		var featureHierarchy = gameSupport.getHierarchy(true);
		var supportedFeatures = {};
		currentBrowser.browser.features = featureHierarchy;
		_.each(currentBrowser.browser.features, function(group, cat){
			_.each(group, function(obj, key){
				supportedFeatures[key] = obj;
			});
		});
		currentBrowser.browser.supportedFeatures = supportedFeatures;
		return currentBrowser;

	}

	return {
		getCurrentBrowser : getCurrentBrowser
	};

}]);



/**
 * @ngdoc directive
 * @name game-demos
 * @description
 * Game Demos
 */
angular.module('app').directive('gameDemos', ["game", "gameSupport", "$compile", "$filter", "$templateCache", "$timeout", function(game, gameSupport, $compile, $filter, $templateCache, $timeout){
	return {
		restrict: 'C',
		scope: true,
		link: function(scope, element, attr){

			/**
			 * unload the game test iframe
			 *
			 * @param {Function} cb
			 */
			function unloadIframe(cb){
				var container = $('.demo-viewer');
				var iframe = $('iframe');
				if (!iframe || !iframe.attr('src')){
					container.html('');
					return cb();
				}
				iframe.attr('src', '/assets/games/blank.html');
				$timeout(function(){
					iframe.remove();
					container.html('');
					cb();
				}, 100);
			}

			// use active demo filter
			var byActiveDemoGame = $filter('byActiveDemoGame');

			// get/expose games
			scope.games = byActiveDemoGame(game.getGames(), scope.currentBrowser);

			// get features
			var features = {};
			_.each(gameSupport.getFeatures(), function(feature){
				features[feature] = {
					selected   : false,
					filterable : false
				};
			});

			// identify filterable features
			var filterable = [];
			_.each(scope.games, function(game){
				filterable = filterable.concat(game.features);
			});
			filterable = _.uniq(filterable).sort();

			// update feature states
			_.each(filterable, function(feature){
				features[feature].selected   = true;
				features[feature].filterable = true;
			});

			// expose features
			scope.features = features;

			scope.playDemo = function(gameKey){

				// get selected game
				scope.selectedGame = scope.games[gameKey];

				// get demo template, populate with scope, add to modal
				var template = $templateCache.get('demo.html');

				var container = $('.modal-body');

				if (container){

					var iframe = $('<iframe>', {
						id: 'game-frame',
						src: scope.selectedGame.url
					});
					iframe.load(function(){
						var self = this;
						setTimeout(function(){
							self.contentWindow.focus();
						}, 100);
					});
					container.html(template).show();
					$compile(container.contents())(scope);

					var gameContainer = $('.game-container');
					if (gameContainer){
						gameContainer.html(iframe);
					}

					window.onmessage = function(e){
						switch(e.data.msg){
							case 'inheritCanvasSize':
								console.log('inheritCanvasSize', e.data);
								break;
						}
					};

					// show modal
					scope.showModal();

				}

			}

			scope.stopDemo = function(){

				// close modal
				scope.closeModal();

				// wipe modal body contents
				unloadIframe(function(){
					$('.demo-viewer').html('');
				});

			}

		}
	};
}]);


/**
 * @ngdoc directive
 * @name sidebar
 * @description
 * Sidebar interactions for the Demo page on mobile.
 */

angular.module('app').directive('gameDemosControl', ["$timeout", "$rootScope", function($timeout, $rootScope){
	return {
		restrict: 'C',
		scope: false,
		link: function(scope, elem){

			// When the button is clicked
			$('.intro button').on('click', function() {

				// Mark as opened
				elem.addClass('open');

				// Animate the targeted sidebar
				if ($(this).data('target') == 'tags') {
					TweenMax.to($('.tags'), .5, { left: -20, ease: Back.easeOut.config(0.7) });
				} else {
					TweenMax.to($('.search'), .5, { right: -20, ease: Back.easeOut.config(0.7) });
					$('.search input').focus();
				}

				// Lock scrolling
				$('.view-demos').addClass('lock');

				// Blur content
				$rootScope.blur('mobile-demos');

				// What happens when you close the sidebar
				elem.find('.close').on('click', function() {

					// Mark as closed
					elem.removeClass('open');

					// Unlock scroll
					$('.view-demos').removeClass('lock');

					// Reset sidebar
					TweenMax.to($('.tags'), .5, { left: '-120%', ease: Back.easeOut.config(0.7) });
					TweenMax.to($('.search'), .5, { right: '-120%', ease: Back.easeOut.config(0.7) });

					// Unblur content
					$rootScope.unblur('mobile-demos');

				});
			});
		}
	};
}]);

'use strict';

/**
 * @ngdoc directive
 * @name game-chart
 * @description
 * Output a game support chart comparing features to the current browser
 */
angular.module('app').directive('gameChart', ["$compile", "game", function($compile, game){
	return {
		restrict: 'C',
		link: function(scope, elem){

			// games
			var games = game.getGames();

			// generete template
			var html = '<table class="table">';

			var hasResults = !!(scope.results);

			// create a custom feature collection
			var features = ['canvas', 'webgl', 'webgl2', 'gamepad'];

			// feature headers
			html += '<tr><th colspan="2"></th>';
			_.each(features, function(feature){
				html += '<th>' + feature + '</th>';
			});
			if (hasResults){
				html += '<th>results</th>';
			}
			html += '</tr>';

			// each game
			_.each(games, function(game, key){
				html += '<tr><td>' + game.name + '</td><td><img style="max-width:100px;" src="' + game.icon + '"/></td>';
				_.each(features, function(feature){
					if (_.contains(game.features, feature)){
						html += '<td>yes</td>';
					} else {
						html += '<td>no</td>';
					}
				});
				if (hasResults){
					html += '<td>' + (Math.round((scope.results[key].stopTime - scope.results[key].startTime) * 100) / 100) + 'ms</td>';
				}
				html += '</tr>';
			});

			html += '</table>';

			// show template
			elem.html(html).show();

			// link the scope to template
			$compile(elem.contents())(scope);
		}
	};
}]);


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


'use strict';

angular.module('app').filter('gravatar', ["md5", function(md5){
	return function(email){
		return '//www.gravatar.com/avatar/' + md5.hash(email);
	};
}]);


'use strict';

/**
 * @ngdoc directive
 * @name html
 * @description
 * Monitor page and state changes, record activity in scope, and report results to Google Analytics.
 */
angular.module('app').directive('html', ["$location", "$state", "$window", "page", "gameBrowser", function($location, $state, $window, page, gameBrowser){
	return {
		restrict: 'E',
		link: function(scope){

			// maintain page data at the highest level
			scope.page = page.data;

			// utility (only use in templates for development purposes)
			scope._ = _;

			// test results
			scope.results = null;

			// status message
			scope.status = null;

			// setup browser info
			scope.currentBrowser = gameBrowser.getCurrentBrowser();
			scope.browserName = scope.currentBrowser.browser.name.toLowerCase();

			// used in feature chart
			scope.currentVersionSnippet = scope.currentBrowser.browser.version;
			if (scope.currentVersionSnippet.toString().length <= 6){
				scope.currentVersionSnippet = 'Version ' + scope.currentVersionSnippet;
			}

			// set mobile test
			scope.isMobile = (scope.currentBrowser.device.type === 'mobile');

			// state object
			scope.state = $state;

			// game testing state
			scope.testStateClass = null;

			// before view render
			// set scope info for state and page data
			scope.$on('$stateChangeStart', function(event, toState, toParams){
				scope.stateClass = toParams.slug;		// bind to body for "page" styling
				scope.stateName = toState.name;			// state.go('this')
				scope.statePath = $location.url();		// state switch key
				scope.stateUrl = $location.absUrl();	// uri (absolute url)
				scope.stateParams = toParams;			// state path params (e.g. /my/path/:param)
				scope.page = page.normalizeData(scope.pages[scope.stateClass]);
			});

			// after view render
			// make state views synonymous with page views in google analytics
			scope.$on('$stateChangeSuccess', function(event, toState){
				$window.ga('send', 'pageview', {page: toState.url});
			});
		},
		controller: ["$scope", "$templateCache", function($scope, $templateCache){

			// clean slate
			var data = {};

			// get keys from templateCache (using custom decorator)
			var keys = $templateCache.getKeys();
			_.each(keys, function(key){

				// initialize template object
				var self = {
					slug: key.replace(/\.html$/, ''),
					html: $templateCache.get(key),
					text: $('<div>'+$templateCache.get(key)+'</div>').text().replace(/[\r\n\s]+/g, ' ').trim()
				};

				// extract metadata from input fields
				var inputs = $(self.html).filter('input[metadata]');
				_.each(inputs, function(input){
					self[input.name] = input.value;
				});

				// assign normalized template data
				data[self.slug] = page.normalizeData(self);

			});

			// final results
			$scope.pages = data;
		}]
	};
}]);


'use strict';

/**
 * @ngdoc directive
 * @name logo
 * @description
 * OpenWebGames Logo
 */
angular.module('app').directive('logo', function(){
	return {
		restrict: 'C',
		templateUrl: 'logo.html'
	};
});


'use strict';

/**
 * Joseph Myers JavaScript MD5 Algorithm converted into an Angular Factory
 * http://www.myersdaily.org/joseph/javascript/md5-text.html
 */
angular.module('app').factory('md5', function(){

	function md5cycle(x, k){
		var a = x[0], b = x[1], c = x[2], d = x[3];

		a = ff(a, b, c, d, k[0], 7, -680876936);
		d = ff(d, a, b, c, k[1], 12, -389564586);
		c = ff(c, d, a, b, k[2], 17,  606105819);
		b = ff(b, c, d, a, k[3], 22, -1044525330);
		a = ff(a, b, c, d, k[4], 7, -176418897);
		d = ff(d, a, b, c, k[5], 12,  1200080426);
		c = ff(c, d, a, b, k[6], 17, -1473231341);
		b = ff(b, c, d, a, k[7], 22, -45705983);
		a = ff(a, b, c, d, k[8], 7,  1770035416);
		d = ff(d, a, b, c, k[9], 12, -1958414417);
		c = ff(c, d, a, b, k[10], 17, -42063);
		b = ff(b, c, d, a, k[11], 22, -1990404162);
		a = ff(a, b, c, d, k[12], 7,  1804603682);
		d = ff(d, a, b, c, k[13], 12, -40341101);
		c = ff(c, d, a, b, k[14], 17, -1502002290);
		b = ff(b, c, d, a, k[15], 22,  1236535329);

		a = gg(a, b, c, d, k[1], 5, -165796510);
		d = gg(d, a, b, c, k[6], 9, -1069501632);
		c = gg(c, d, a, b, k[11], 14,  643717713);
		b = gg(b, c, d, a, k[0], 20, -373897302);
		a = gg(a, b, c, d, k[5], 5, -701558691);
		d = gg(d, a, b, c, k[10], 9,  38016083);
		c = gg(c, d, a, b, k[15], 14, -660478335);
		b = gg(b, c, d, a, k[4], 20, -405537848);
		a = gg(a, b, c, d, k[9], 5,  568446438);
		d = gg(d, a, b, c, k[14], 9, -1019803690);
		c = gg(c, d, a, b, k[3], 14, -187363961);
		b = gg(b, c, d, a, k[8], 20,  1163531501);
		a = gg(a, b, c, d, k[13], 5, -1444681467);
		d = gg(d, a, b, c, k[2], 9, -51403784);
		c = gg(c, d, a, b, k[7], 14,  1735328473);
		b = gg(b, c, d, a, k[12], 20, -1926607734);

		a = hh(a, b, c, d, k[5], 4, -378558);
		d = hh(d, a, b, c, k[8], 11, -2022574463);
		c = hh(c, d, a, b, k[11], 16,  1839030562);
		b = hh(b, c, d, a, k[14], 23, -35309556);
		a = hh(a, b, c, d, k[1], 4, -1530992060);
		d = hh(d, a, b, c, k[4], 11,  1272893353);
		c = hh(c, d, a, b, k[7], 16, -155497632);
		b = hh(b, c, d, a, k[10], 23, -1094730640);
		a = hh(a, b, c, d, k[13], 4,  681279174);
		d = hh(d, a, b, c, k[0], 11, -358537222);
		c = hh(c, d, a, b, k[3], 16, -722521979);
		b = hh(b, c, d, a, k[6], 23,  76029189);
		a = hh(a, b, c, d, k[9], 4, -640364487);
		d = hh(d, a, b, c, k[12], 11, -421815835);
		c = hh(c, d, a, b, k[15], 16,  530742520);
		b = hh(b, c, d, a, k[2], 23, -995338651);

		a = ii(a, b, c, d, k[0], 6, -198630844);
		d = ii(d, a, b, c, k[7], 10,  1126891415);
		c = ii(c, d, a, b, k[14], 15, -1416354905);
		b = ii(b, c, d, a, k[5], 21, -57434055);
		a = ii(a, b, c, d, k[12], 6,  1700485571);
		d = ii(d, a, b, c, k[3], 10, -1894986606);
		c = ii(c, d, a, b, k[10], 15, -1051523);
		b = ii(b, c, d, a, k[1], 21, -2054922799);
		a = ii(a, b, c, d, k[8], 6,  1873313359);
		d = ii(d, a, b, c, k[15], 10, -30611744);
		c = ii(c, d, a, b, k[6], 15, -1560198380);
		b = ii(b, c, d, a, k[13], 21,  1309151649);
		a = ii(a, b, c, d, k[4], 6, -145523070);
		d = ii(d, a, b, c, k[11], 10, -1120210379);
		c = ii(c, d, a, b, k[2], 15,  718787259);
		b = ii(b, c, d, a, k[9], 21, -343485551);

		x[0] = add32(a, x[0]);
		x[1] = add32(b, x[1]);
		x[2] = add32(c, x[2]);
		x[3] = add32(d, x[3]);
	}

	function cmn(q, a, b, x, s, t) {
		a = add32(add32(a, q), add32(x, t));
		return add32((a << s) | (a >>> (32 - s)), b);
	}

	function ff(a, b, c, d, x, s, t) {
		return cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}

	function gg(a, b, c, d, x, s, t) {
		return cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}

	function hh(a, b, c, d, x, s, t) {
		return cmn(b ^ c ^ d, a, b, x, s, t);
	}

	function ii(a, b, c, d, x, s, t) {
		return cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	function md51(s) {
		txt = '';
		var n = s.length,
		state = [1732584193, -271733879, -1732584194, 271733878], i;
		for (i=64; i<=s.length; i+=64) {
			md5cycle(state, md5blk(s.substring(i-64, i)));
		}
		s = s.substring(i-64);
		var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
		for (i=0; i<s.length; i++)
			tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
		tail[i>>2] |= 0x80 << ((i%4) << 3);
		if (i > 55) {
			md5cycle(state, tail);
			for (i=0; i<16; i++) tail[i] = 0;
		}
		tail[14] = n*8;
		md5cycle(state, tail);
		return state;
	}

	/* there needs to be support for Unicode here,
	 * unless we pretend that we can redefine the MD-5
	 * algorithm for multi-byte characters (perhaps
	 * by adding every four 16-bit characters and
	 * shortening the sum to 32 bits). Otherwise
	 * I suggest performing MD-5 as if every character
	 * was two bytes--e.g., 0040 0025 = @%--but then
	 * how will an ordinary MD-5 sum be matched?
	 * There is no way to standardize text to something
	 * like UTF-8 before transformation; speed cost is
	 * utterly prohibitive. The JavaScript standard
	 * itself needs to look at this: it should start
	 * providing access to strings as preformed UTF-8
	 * 8-bit unsigned value arrays.
	 */
	function md5blk(s) { /* I figured global was faster.   */
		var md5blks = [], i; /* Andy King said do it this way. */
		for (i=0; i<64; i+=4) {
			md5blks[i>>2] = s.charCodeAt(i)
			+ (s.charCodeAt(i+1) << 8)
			+ (s.charCodeAt(i+2) << 16)
			+ (s.charCodeAt(i+3) << 24);
		}
		return md5blks;
	}

	var hex_chr = '0123456789abcdef'.split('');

	function rhex(n){
		var s='', j=0;
		for(; j<4; j++)
			s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
			+ hex_chr[(n >> (j * 8)) & 0x0F];
		return s;
	}

	function hex(x) {
		for (var i=0; i<x.length; i++)
		x[i] = rhex(x[i]);
		return x.join('');
	}

	function md5(s) {
		return hex(md51(s));
	}

	/* this function is much faster,
	so if possible we use it. Some IEs
	are the only ones I know of that
	need the idiotic second function,
	generated by an if clause.  */

	function add32(a, b) {
		return (a + b) & 0xFFFFFFFF;
	}

	if (md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
		function add32(x, y) {
			var lsw = (x & 0xFFFF) + (y & 0xFFFF),
			msw = (x >> 16) + (y >> 16) + (lsw >> 16);
			return (msw << 16) | (lsw & 0xFFFF);
		}
	}

	return {
		hash: md5
	};

});


'use strict';

/**
 * @ngdoc directive
 * @name metadata
 * @description
 * Define page metadata via hidden input fields.
 * Note: This directive is a documentation placeholder, the implementation is found in the html directive's controller.
 */
angular.module('app').directive('metadata', function(){
	return {};
});


'use strict';

/**
 * @ngdoc directive
 * @name modal
 * @description
 * OpenWebGames Modal Component
 */
angular.module('app').directive('modal', ["$rootScope", function($rootScope){
	var sampleData = {'sponzadynamicshadows':{'name':'Sponza Dynamic Shadows','icon':'/assets/games/sponza.jpg','url':'/assets/games/sponza.html','width':1366,'height':768,'features':['optimizedJavaScript','webGl'],'timeout':60000,'credits':[{'category':'WebGL JavaScript Framework','name':'BabylonJS','url':'http://www.babylonjs.com/','$$hashKey':'object:39'}],'mobile':false,'desktop':true,'status':'success','startTime':4134.35,'timer':'00:35','timeoutPercentage':0,'interval':{'$$state':{'status':2,'value':'cancelled','processScheduled':false},'$$intervalId':36},'stopTime':39645.955,'results':{'totalTime':35535,'wrongPixels':34,'cpuTime':14013,'cpuIdle':0.6056595835690157,'fps':56.28206318787234,'pageLoadTime':162.35000000000002,'numStutterEvents':32,'result':'FAIL'}},'suntemple':{'name':'Sun Temple','icon':'/assets/games/suntemple.png','url':'/assets/games/suntemple.html','width':1366,'height':768,'features':['optimizedJavaScript','webGl'],'timeout':120000,'credits':[{'category':'Unreal Engine 4.10','name':'Sun Temple','url':'https://www.unrealengine.com/','$$hashKey':'object:59'}],'mobile':false,'desktop':true,'status':'success','startTime':102041.78,'timer':'01:12','timeoutPercentage':0,'interval':{'$$state':{'status':2,'value':'cancelled','processScheduled':false},'$$intervalId':252},'stopTime':175307.795,'results':{'totalTime':73291,'wrongPixels':3,'cpuTime':69251,'cpuIdle':0.05512089924838826,'fps':38.203880054279516,'pageLoadTime':60899.490000000005,'numStutterEvents':99,'result':'PASS'}}};

	return {
		restrict: 'E',
		templateUrl: 'modal.html',
		scope: false,
		link: function(scope){
			scope.modalTitle = '';
			scope.modalContent = '';
			scope.modalButton = 'Close';

			scope.showModal = function(){
				$('#modal').modal('show');
				$('#modal div.modal-header').css('display', scope.modalTitle ? 'block' : 'none');
				$('#modal div.modal-footer').css('display', scope.modalButton ? 'block' : 'none');
			};

			scope.closeModal = function(){
				$('#modal').modal('hide');
			};

			scope.setModalTitle = function(title){
				scope.modalTitle = title;
			};

			scope.setModalContent = function(content){
				scope.modalContent = content;
			};

			scope.setModalButton = function(button){
				scope.modalButton = button;
			};

			scope.showSampleResults = function(){
				scope.setModalTitle('Sample Data');
				scope.setModalContent('<pre>' + JSON.stringify(sampleData, null, 4) + '</pre>');
				scope.setModalButton('Close Sample');
				scope.showModal();
			};

			scope.fullscreenModal = function(id){

				var el = document.getElementById(id);

				if(el.requestFullscreen) {
					el.requestFullscreen();
				} else if(el.mozRequestFullScreen) {
					el.mozRequestFullScreen();
				} else if(el.webkitRequestFullscreen) {
					el.webkitRequestFullscreen();
				} else if(el.msRequestFullscreen) {
					el.msRequestFullscreen();
				}

			}

			$('#modal').on('show.bs.modal', function(){

				// blur page underneath
				$rootScope.blur();

				// disable page scroll
				$('body').css('overflow', 'hidden');

				// hide visual arrows
				$('nav-arrow').addClass('hidden');

			});

			$('#modal').on('hide.bs.modal', function(){

				// remove page blur
				$rootScope.unblur();

				// enable page scroll
				$('body').css('overflow', 'auto');

				// show visual arrows (as were hidden by this modal)
				$('nav-arrow').removeClass('hidden');

			});

		}
	};
}]);

'use strict';

/**
 * @ngdoc directive
 * @name nav-arrow
 * @description
 * OpenWebGames Down Navigation UI Component
 */
angular.module('app').directive('navArrow', ["navigation", "$state", function(navigation, $state){
	return {
		restrict: 'E',
		templateUrl: 'navArrowButton.html',
		scope: {},
		link: function(scope, element, attr){
			var direction = scope.direction = attr.direction;
			var transitionVars = {
				paused: true,
				ease: 'Quart.easeInOut',
				css: {}
			};

			switch (direction) {
				case 'up':
					transitionVars.css.y = '-120';
				break;
				case 'down':
					transitionVars.css.y = '120';
				break;
				case 'left':
					transitionVars.css.x = '-150%';
				break;
				case 'right':
					transitionVars.css.x = '150%';
				break;
			}

			var transition = TweenMax.to(element.find('.nav-arrow'), 0.2, transitionVars);

			function transitionIn(callback){
				transition.eventCallback('onReverseComplete', callback);
				transition.reverse();
			}

			function transitionOut(callback){
				transition.eventCallback('onComplete', callback);
				transition.play();
			}

			scope.$on('$stateChangeStart', function(event, toState, toParams){
				function updateScope(){
					var navDescriptor = navigation.getDescriptor(toParams.slug);

					if (!navDescriptor || !direction){
						return;
					}

					var nextDestination = navDescriptor.directions[direction];

					if (nextDestination){
						scope.slug = nextDestination.id;
						scope.name = nextDestination.name;
					} else {
						scope.slug = null;
						scope.name = null;
					}
				}

				// Update the navigation arrow immediately
				if (!$state.params.slug) {
					return updateScope();
				}

				transitionOut(function(){
					var deregister;
					var timeoutId;

					var onEnter = _.once(function() {
						if (deregister) {
							deregister();
						}

						clearTimeout(timeoutId);

						updateScope();
						transitionIn();
					});

					deregister = scope.$on('gsapifyRouter:enterSuccess', onEnter);
					timeoutId = setTimeout(onEnter, 201);
				});
			});

			function setTransitionDirection(){
				$state.transitionDirection = direction;
			}

			element.click(setTransitionDirection);

			element.on('$destroy', function(){
				element.unbind('click', setTransitionDirection);
			});
		}
	};
}]);

'use strict';

/**
 * @ngdoc directive
 * @name nav-main
 * @description
 * OpenWebGames Main Navigation UI Component
 */
angular.module('app').directive('navMain', ["$document", "$timeout", "$rootScope", function($document, $timeout, $rootScope){
	return {
		restrict: 'E',
		templateUrl: 'navMain.html',
		scope: {},
		link: function(scope, element){
			scope.showMenu = false;

			var document = $document[0];
			var icon = element[0].querySelector('.nav-main__icon');

			var openMenu = function(){
				scope.showMenu = true;
				$rootScope.blur();

				$timeout(function(){ document.addEventListener('click', closeMenu); });
			};

			var closeMenu = function(){
				document.removeEventListener('click', closeMenu);

				scope.showMenu = false;
				$rootScope.unblur();
			};

			icon.addEventListener('click', openMenu);

			// Cleanup listeners
			element.on('$destroy', function(){
				icon.removeEventListener('click', openMenu);
				document.removeEventListener('click', closeMenu);
			});
		}
	};
}]);

'use strict';

/**
 * @ngdoc directive
 * @name nav-main-button
 * @description
 * OpenWebGames Main Navigation UI Component's Button
 */
angular.module('app').directive('navMainButton', ["$state", function($state){
	return {
		restrict: 'E',
		templateUrl: 'navMainButton.html',
		transclude: true,
		scope: {},
		link: function(scope, elem, attr){
			if (attr.slug !== null) {
				scope.slug = attr.slug;
			}

			scope.navigate = function(){
				if (!scope.slug) {
					return;
				}

				$state.go('app.page', {slug: scope.slug});
			};

			scope.isActive = !scope.slug ? false : $state.params.slug === scope.slug;

			scope.$on('$stateChangeSuccess', function(event, toState, toParams){
				scope.isActive = !scope.slug ? false : toParams.slug === scope.slug;
			});
		}
	};
}]);

'use strict';

/**
 * @ngdoc directive
 * @name nav-button-group
 * @description
 * OpenWebGames Button Group Navigation UI Component
 */
angular.module('app').directive('navSecondary', function(){
	return {
		restrict: 'C',
		templateUrl: 'navSecondary.html'
	};
});


'use strict';

/**
 * @ngdoc service
 * @name navigation
 * @description
 * Provide directional navigation through the site
 */
angular.module('app').factory('navigation', ["$state", "$q", function($state, $q){

	var resources = {
		id: 'resources',
		name: 'Resources',
		directions: {}
	};

	var media = {
		id: 'media',
		name: 'Logos & Font',
		directions: {}
	};

	var home = {
		id: 'home',
		name: 'Home',
		directions: {}
	};

	var features = {
		id: 'features',
		name: 'Features',
		directions: {}
	};

	var rights = {
		id: 'rights',
		name: 'Content Rights',
		directions: {}
	};

	var upgrade = {
		id: 'upgrade',
		name: 'Upgrade Your Browser',
		directions: {}
	};

	var faq = {
		id: 'faq',
		name: 'FAQ',
		directions: {}
	};

	var timeline = {
		id: 'timeline',
		name: 'Timeline',
		directions: {}
	};

	var tests = {
		id: 'tests',
		name: 'Run Test',
		directions: {}
	};

	var demos = {
		id: 'demos',
		name: 'Play Demos',
		directions: {}
	};

	resources.directions.right = home;
	resources.directions.down = media;

	media.directions.right = features;
	media.directions.up = resources;
	media.directions.down = rights;

	home.directions.right = timeline;
	home.directions.left = resources;
	home.directions.down = _.clone(features);
	home.directions.down.name = 'Run the Test';

	features.directions.up = home;
	features.directions.down = upgrade;
	features.directions.left = media;

	upgrade.directions.up = features;
	upgrade.directions.left = rights;

	rights.directions.up = media;
	rights.directions.right = upgrade;

	faq.directions.down = timeline;

	timeline.directions.up = faq;
	timeline.directions.left = home;

	var map = {
		resources: resources,
		media: media,
		home: home,
		features: features,
		rights: rights,
		upgrade: upgrade,
		faq: faq,
		timeline: timeline,
		tests: tests
	};

	/**
	 * get the current descriptor
	 *
	 * @param {String} id
	 * @return {Object}
	 */
	function getDescriptor(id){
		return map[id];
	}

	/**
	 * navigate to a destination based on direction
	 *
	 * @param {String} direction
	 * @return {Promise}
	 */
	function navigateByDirection(direction){
		var currentPage = $state.params.slug;

		if (!currentPage) {
			throw new Error('`$state.params.slug` was undefined.');
		}

		if (!$state.params.slug){
			// hidden pages are null
			return;
		}

		var destination = getDescriptor($state.params.slug).directions[direction];

		if (!destination) {
			return $q.reject('Invalid direction specified: ' + direction);
		}

		$state.transitionDirection = direction;

		return $state.go('app.page', {slug: destination.id});
	}

	return {
		getDescriptor: getDescriptor,
		navigateByDirection : navigateByDirection
	};

}]);

'use strict';

/**
 * @ngdoc directive
 * @name notification
 * @description
 * OpenWebGames Notification Bar UI Component
 */
angular.module('app').directive('notification', function(){
	return {
		restrict: 'C',
		templateUrl: 'notification.html',
		scope: false,
		link: function(scope, elem){


			if (!scope.currentBrowser.browser.latest){
				var name = scope.currentBrowser.browser.name;
				var stable = scope.currentBrowser.browser.stable.replace(/\..*$/, '');
				scope.status = 'Upgrade ' + name + ' to ' + stable + '!';
			}

			scope.$watch('status', function(value){
				if (value){
					elem.parent('body').addClass('notification');
					elem.find('.inner').addClass('active');
				} else {
					elem.parent('body').removeClass('notification');
					elem.find('.inner').removeClass('active');
				}
			});

		}
	};
});


'use strict';

/**
 * @ngdoc directive
 * @name pad
 * @description
 * Create a functional game pad experience for the home page
 */
angular.module('app').directive('pad', function(){
	return {
		restrict: 'A',
		scope: false,
		link: function(scope, elem){

			elem.find('g[direction]').each(function(idx, el){
				var dir = angular.element(el).attr('direction');
				angular.element(el).on('click', function(){
					scope.triggerArrow(dir);
				});
			});

		}
	};
});


'use strict';

/**
 * @ngdoc service
 * @name page
 * @description
 * Maintains knowledge about the currently loaded page.
 */
angular.module('app').factory('page', function(){

	var data = {};

	var normalizeData = function(obj){
		if (obj && obj.slug){
			return {
				slug		: obj.slug,
				title		: obj.title || '',
				description	: obj.description || '',
				type		: obj.type || 'page',
				url			: obj.url || '/' + obj.slug + '.html',
				imageUrl	: obj.imageUrl || '',
				html		: obj.html || '',
				text		: obj.text || '',
				keywords	: obj.keywords || ''
			};
		} else {
			return null;
		}
	};

	var setData = function(obj){
		data = normalizeData(_.extend(data, obj));
	};

	return {
		data: data,
		normalizeData: normalizeData,
		setData: setData
	};

});


'use strict';

/**
 * @ngdoc directive
 * @name privacy-link
 * @description
 * Open privacy policy from nav item
 */
angular.module('app').directive('privacyLink', ["$window", function($window){
	return {
		restrict: 'C',
		scope: false,
		link: function(scope, elem){

			elem.on('click', function(){
				$window.open('https://www.mozilla.org/privacy/websites/');
			});

		}
	};
}]);




'use strict';

/**
 * @ngdoc directive
 * @name view-report
 * @description
 * Report directive
 */
angular.module('app').directive('viewReport', function(){
	return {
		restrict: 'C',
		scope: true,
		link: function(scope, element){

			var content = $('.content');
			var confirmation = element.find('.confirmation');
			var confirmationSuccess = element.find('.confirmation .success');
			var confirmationError = element.find('.confirmation .error');
			var button = element.find('.confirmation button.close');

			scope.resetConfirmation = function(){
				confirmation.addClass('is-hidden');
				confirmationSuccess.addClass('is-hidden');
				confirmationError.addClass('is-hidden');
			};

			scope.showConfirmation = function(success){
				scope.resetConfirmation();
				document.body.scrollTop = document.documentElement.scrollTop = 0;
				if (success){
					confirmationSuccess.removeClass('is-hidden');
				} else {
					confirmationError.removeClass('is-hidden');
				}
				content.addClass('blur');
				confirmation.removeClass('is-hidden');
			};

			scope.hideConfirmation = function(){
				content.removeClass('blur');
				confirmation.addClass('is-hidden');
			};

			button.on('click', function(){
				scope.hideConfirmation();
			});

		}
	};
});


'use strict';

angular.module('app').filter('slugify', function(){
	return function(text){
		return text.toString().toLowerCase()
			.replace(/\s+/g, '-')		// spaces as dashes
			.replace(/[^\w-]+/g, '')	// ignore non-words
			.replace(/-+/g, '-')		// only one dash
			.replace(/_+/g, '_')		// only one underscore
			.replace(/^[_-]/, '')		// only chars at start
			.replace(/[_-]$/g, '');		// only chars at end
	};
});


'use strict';

/**
 * @ngdoc directive
 * @name snippet
 * @description
 * Generic snippet include functionality
 */
angular.module('app').directive('snippet', ["$compile", "$templateCache", function($compile, $templateCache){
	return {
		restrict: 'A',
		link: function(scope, elem, attr){

			var html = $templateCache.get(attr.snippet + '.html');
			if (html){

				// show template
				elem.html(html).show();

				// compile scope
				$compile(elem.contents())(scope);

			}

		}
	};
}]);


'use strict';

/**
 * @ngdoc interface
 * @name $templateCache.getKeys
 * @description
 * Adds getKeys to $templateCache.
 */
angular.module('app')
	.config(["$provide", function config($provide){
		$provide.decorator('$templateCache', ["$delegate", function($delegate){
			var keys = [], origPut = $delegate.put;
			$delegate.put = function(key, value) {
				origPut(key, value);
				keys.push(key);
			};
			$delegate.getKeys = function() {
				return keys;
			};
			return $delegate;
		}]);
	}]);


'use strict';

/**
 * @ngdoc directive
 * @name testDrive
 * @description
 * Automated test drive experience which plays games and captures performance results.
 */
angular.module('app').directive('testDrive', ["$compile", "$filter", "$state", "$templateCache", "$interval", "$timeout", "game", function($compile, $filter, $state, $templateCache, $interval, $timeout, game){

	return {
		restrict: 'C',
		scope: false,
		link: function(scope){

			/**
			 * record game test results
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function record(){
				// @todo: record results here
				console.log('record() not implemented');
			}

			/**
			 * determine if the current game is skippable right now
			 *
			 * @param {Void}
			 * @return {Boolean}
			 */
			function isSkippable(){
				if (scope.activeGameKey){
					return (scope.games[scope.activeGameKey].status === 'running');
				}
				return false;
			}

			/**
			 * skip the currently active game
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function skip(){
				if (isSkippable()){
					scope.games[scope.activeGameKey].error = new Error('Player skipped game');
					stopGame(scope.activeGameKey);
				}
			}

			/**
			 * cancel the current game test sequence
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function cancel(){
				scope.$evalAsync(function(){
					scope.$parent.testState = 'cancelled';
					scope.activeGameIndex = keys.length - 1;
					scope.games[scope.activeGameKey].error = new Error('Player cancelled test');
					stopGame(scope.activeGameKey);
				});
			}

			/**
			 * start a specific game
			 *
			 * @param {String} key
			 * @return {Void}
			 */
			function start(key){
				preloadComplete(function(){
					scope.$evalAsync(function(){
						if (!(key in scope.games)){
							return console.error(new Error('Unrecognized game: ' + key));
						}

						scope.activeGameKey = key;
						scope.games[key].startTime = window.performance.now();
						scope.games[key].timer = '';
						scope.games[key].timeoutPercentage = 0;
						scope.games[key].status = 'running';
						scope.games[key].interval = $interval(function(){
							var now = window.performance.now();
							var ms = (now - scope.games[key].startTime);
							if (ms > scope.games[key].timeout){
								scope.games[key].error = new Error('Game timed out');
								scope.games[key].status = 'timeout';
								stopGame(key);
							}
							var m = ('0' + Math.floor((ms / 1000) / 60)).substr(-2);
							var s = ('0' + Math.floor((ms / 1000) - (m * 60))).substr(-2);
							scope.games[key].timer = m + ':' + s;
						}, 1000);
					});
				});
			}

			/**
			 * finish the current game test sequence
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function finish(){
				scope.$evalAsync(function(){
					record();
					scope.$parent.results = scope.games;

					scope.activeGameKey = null;
					if (scope.$parent.testState !== 'cancelled'){
						scope.$parent.testState = 'completed';
					}

					$('.status .timer').show();
					$('.game-tracker').hide();
				});
			}

			/**
			 * start running a new game test sequence
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function run(){
				if (cancelTimeout !== null) {
					$timeout.cancel(cancelTimeout);
					cancelTimeout = null;
				}

				scope.$evalAsync(function(){
					scope.$parent.testState = 'in-progress';
					scope.activeGameKey = scope.activeGameKey || keys[0];
					loadIframe(scope.games[scope.activeGameKey].url + '?playback', {
						width		: scope.games[scope.activeGameKey].width,
						height		: scope.games[scope.activeGameKey].height,
						frameBorder	: 0
					});
				});
			}

			/**
			 * load the game test iframe
			 *
			 * @param {String} url
			 * @param {Object} options
			 * @return {Void}
			 */
			function loadIframe(url, options){
				options.src = url;
				var container = $('#game-container');
				if (container){
					var iframe = $('<iframe>', options);
					iframe.load(function(){

						// share iframe dimensions with contentWindow
						if (options.width && options.height){
							this.contentWindow.postMessage({
								msg	: 'iframeSize',
								width	: options.width,
								height	: options.height
							}, '*');
						}

					});
					container.html(iframe);
				}
			}

			/**
			 * unload the game test iframe
			 *
			 * @param {Function} cb
			 */
			function unloadIframe(cb){
				var container = $('#game-container');
				var iframe = $('iframe');
				if (!iframe || !iframe.attr('src')){
					container.html('');
					return cb();
				}
				iframe.attr('src', '/assets/games/blank.html');
				$timeout(function(){
					iframe.remove();
					container.html('');
					cb();
				}, 100);
			}

			/**
			 * restart the game test sequence
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function restart(){
				unloadIframe(function(){
					scope.activeGameKey = null;
					scope.activeGameIndex = 0;
					run();
				});
			}

			/**
			 * view the game test results on the features page
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function viewResults(){
				$state.go('app.page', {slug: 'features'});
			}

			/**
			 * view the game test results on the JSON modal overlay
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function viewResultsModal(){
				scope.$parent.setModalTitle('Your Test Results');
				scope.$parent.setModalContent('<pre>' + JSON.stringify(scope.$parent.results, null, 4) + '</pre>');
				scope.setModalButton('Close Results');
				scope.$parent.showModal();
			}

			/**
			 * prime the loading status for the current game
			 *
			 * @param {String} key
			 * @return {Void}
			 */
			function preloadGame(){
				preloadProgress(0);
			}

			/**
			 * reset the loading status for the next game
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function preloadReset(){
				scope.$evalAsync(function(){
					scope.loadingPercent = '';
				});
			}

			var preloading = false;
			var preloadQueue = [];

			/**
			 * process the loading status for the current game
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function processProgress(){
				if (preloading){
					if (!preloadQueue.length){
						return $timeout(processProgress, 50);
					}
					scope.$evalAsync(function(){
						var amount = _.head(preloadQueue) || 0;
						preloadQueue = _.slice(preloadQueue, 1).sort();
						var percent = (amount * 100).toFixed(2);
						scope.loadingPercent = percent + '%';
						$timeout(processProgress, 50);
					});
				}
			}

			/**
			 * update the loading status for the current game
			 *
			 * @param {Float} amount (0 to 1)
			 * @return {Void}
			 */
			function preloadProgress(amount){

				// first time, fire it up
				if (amount === 0){
					preloading = true;
					preloadQueue = [0];
					processProgress();
				}

				var minimumGap = 0.15;
				var currentAmount = parseInt(scope.loadingPercent.replace(/\%$/, '') || 0) / 100;
				var lastAmount = _.last(preloadQueue);

				if (lastAmount === currentAmount){
					return;
				}

				if (amount - Math.max(lastAmount, currentAmount) <= minimumGap){
					return preloadQueue.push(amount);
				}

				// fill gap with artifical amounts
				var artificialAmount = currentAmount * 10000;
				var minAmount = 200;
				var maxAmount = 1000;
				while (artificialAmount < (amount * 10000)){
					artificialAmount = Math.min(_.random(minAmount, maxAmount) + artificialAmount, 10000);
					preloadQueue.push(artificialAmount / 10000);
				}

			}

			/**
			 * complete the current preload sequence
			 *
			 * @param {Function} cb
			 */
			function preloadComplete(cb){
				$timeout(function(){
					preloadProgress(1);
					if (preloadQueue.length === 0){
						preloading = false;
						cb();
					} else {
						preloadComplete(cb);
					}
				}, 50);
			}

			/**
			 * create an artifical loading experience
			 *
			 * @param {String} key
			 */
			function preloadArtificially(key){

				var percent = 0;
				var delay = 50;
				var min = 200;
				var max = 1000;

				// prime
				preloadProgress(percent);

				// loop
				var artificialProgress = function(){
					if (percent < 10000){
						percent = Math.min(_.random(min, max) + percent, 10000);
						preloadProgress(percent / 10000);
						setTimeout(artificialProgress, delay);
					} else {
						start(key);
					}
				};
				artificialProgress();

			}

			/**
			 * start the game playback experience and complete the loader experience
			 *
			 * @param {String} key
			 * @return {Void}
			 */
			function startGame(key){
				if (!scope.loadingPercent){
					console.log('starting game (artificial load)', key);
					preloadArtificially(key);
				} else {
					console.log('starting game', key);
					start(key);
				}
			}

			/**
			 * pause the game playback experience
			 *
			 * @param {String} key
			 * @return {Void}
			 */
			function pauseGame(){
				console.log('pauseGame has not been implemented yet');
			}

			/**
			 * update the current game test ui to reflect active game completion
			 *
			 * @param {String} key
			 * @param {Object} results
			 * @return {Void}
			 */
			function stopGame(key, results){

				console.log('stopping game', key, results);

				// prepare the preloader for the next game
				preloadReset();

				scope.games[key].stopTime = window.performance.now();
				$interval.cancel(scope.games[key].interval);

				if (scope.games[key].error && scope.games[key].error.message === 'Game timed out'){
					scope.games[key].status = 'timeout';
					scope.$parent.testState = 'timeout';
				}

				// @todo: confirm that this does what we expect even when there are errors
				if (results){
					scope.games[key].results = results;
					scope.games[key].status = 'success';
				} else {
					if (scope.games[key].status !== 'timeout'){
						scope.games[key].status = 'failed';
					}
				}

				unloadIframe(function(){

					if ((scope.activeGameIndex + 1) === keys.length){

						// done
						finish();

					} else {

						// queueing up next game
						scope.activeGameIndex = scope.activeGameIndex + 1;
						scope.activeGameKey = keys[scope.activeGameIndex];
						scope.games[scope.activeGameKey].status = 'loading';

						if (scope.$parent.testState === 'timeout'){

							scope.timeoutCountdown = 5;

							var countdownPromise = $interval(function(){
								if (scope.timeoutCountdown <= 0) {
									return $interval.cancel(countdownPromise);
								}

								scope.timeoutCountdown--;
							}, 1000, 5);

							cancelTimeout = $timeout(function(){
								cancelTimeout = null;
								$interval.cancel(countdownPromise);

								run();
							}, 5000);
						} else {
							run();
						}
					}
				});

			}

			var cancelTimeout = null;

			// filters
			var byActiveGame = $filter('byActiveGame');
			var byGameFolderSizeOrder = $filter('byGameFolderSizeOrder');

			scope.isSkippable = isSkippable;

			scope.loadingPercent = '';

			// get games
			scope.games = game.getGames();
			scope.games = byActiveGame(scope.games, scope.currentBrowser);
			scope.games = byGameFolderSizeOrder(scope.games);

			// add properties
			_.each(scope.games, function(obj, key){
				scope.games[key].status = 'queue';
			});

			var keys = _.keys(scope.games);

			// active game
			scope.activeGameKey = null;
			scope.activeGameIndex = 0;
			scope.activeGameCount = keys.length;

			// add a game test state class to the body (for styling purposes)
			scope.$parent.$watch('testState', function(newval) {
				scope.$parent.testStateClass = 'test-state-' + newval;
			});

			if (!scope.$parent.testState || scope.$parent.testState === 'in-progress' || scope.$parent.testState === 'intro' || scope.$parent.testState === 'timeout') {
				if (scope.$parent.results !== null) {
					scope.$parent.testState = 'in-progress';
					$timeout(restart, 0);
				} else {
					scope.$parent.testState = 'intro';
				}
			}

			scope.run = run;
			scope.skip = skip;
			scope.cancel = cancel;
			scope.restart = restart;
			scope.viewResults = viewResults;
			scope.viewResultsModal = viewResultsModal;

			window.onmessage = function(e){
				switch(e.data.msg){
					case 'startGame':
						startGame(e.data.key);
						break;
					case 'pauseGame':
						pauseGame(e.data.key);
						break;
					case 'stopGame':
						stopGame(e.data.key,  e.data.results);
						break;
					case 'preloadGame':
						preloadGame(e.data.key);
						break;
					case 'preloadProgress':
						preloadProgress(e.data.progress);
						break;
				}
			};

		}
	};
}]);

'use strict';

/**
 * @ngdoc directive
 * @name view-timeline
 * @description
 * View directive
 */
angular.module('app').directive('viewTimeline', ["$timeout", function($timeout){
	return {
		restrict: 'C',
		scope: true,
		link: function(scope, element){

			function initializeMouseInteractions(){
				$futures.on('mouseover', function(event){
					futures.forEach(function($component){
						if ($component[0] === event.currentTarget) {
							$component.addClass('active');
							$component.removeClass('inactive');
						} else {
							$component.removeClass('active');
							$component.addClass('inactive');
						}
					});
				});

				$futures.on('mouseout', function(){
					futures.forEach(function($component){
						$component.removeClass('inactive');
						$component.removeClass('active');
					});
				});

				$components.on('mouseover', function(event){
					$today.removeClass('show-content');

					components.forEach(function($component){
						if ($component[0] === event.currentTarget) {
							$component.addClass('active');
							$component.removeClass('inactive');
						} else {
							$component.removeClass('active');
							$component.addClass('inactive');
						}
					});

					$today.addClass('active');

					if ($futureComponent[0] === event.currentTarget) {
						return;
					}

					futures.forEach(function($component){
						if ($component[0] === $today[0]) {
							return;
						}

						$component.removeClass('active');
						$component.addClass('inactive');
					});
				});

				$components.on('mouseout', function(){
					$today.removeClass('active');

					components.forEach(function($component){
						$component.removeClass('inactive');
						$component.removeClass('active');
					});

					futures.forEach(function($component){
						$component.removeClass('active');
						$component.removeClass('inactive');
					});
				});
			}

			// Halo Animations
			function generateHaloVars(){
				return {
					delay: 0.5 + Math.random() * 8,
					css: {
						autoAlpha: 0,
						scale: 0.666 + Math.random() * 1.333
					}
				};
			}

			function getTimelineHeight() {
				setTimeout(function() {
					element.find('.components').height(element.find('.timeline-bg-polyfill')[0].getBoundingClientRect().height);
				}, 500);
			}

			var $components = element.find('.component');
			var components = $components.toArray().map(function(component){ return $(component); });
			// Remove the Today / Future component
			var $futureComponent = components.pop();
			var $futures = $futureComponent.find('.component-content > div');
			var futures = $futures.toArray().map(function(component){ return $(component); });
			var $today = element.find('.future-today');

			$timeout(initializeMouseInteractions, 0);

			if(scope.browserName === 'ie' || scope.browserName === 'edge') {

				// Edge 12 & IE 11 need a set height on the container in order to display the SVG.
				// Furthermore, both browsers are unable to get the height of an absolutely positioned
				// SVG so `.timeline-bg-polyfill` is used to get height.
				getTimelineHeight();
				$(window).resize(function() {
					getTimelineHeight();
				});

			}

			var halos = element.find('.dot-halo').toArray();

			halos.forEach(function(halo){
				TweenMax.set(halo, {
					css: {
						autoAlpha: 1,
						scale: 0,
						transformOrigin: '50% 50%'
					}
				});

				var haloVars = _.merge(generateHaloVars(), {
					ease: 'Quint.easeOut',
					repeat: -1,
					onRepeat: function() {
						this.updateTo(generateHaloVars(), true);
					}
				});

				TweenMax.to(halo, 3, haloVars);
			});

			// Today Animations
			var TIMING = 3;
			var todayElement = element.find('.today-dot');
			var todayTimeline = new TimelineMax({ repeat: -1 });

			// Setup
			TweenMax.set(todayElement.find('#inner-halo-1'), {
				css: {
					autoAlpha: 0.7,
					scale: 0.7,
					transformOrigin: '50% 50%'
				}
			});

			TweenMax.set(todayElement.find('#inner-halo-2'), {
				css: {
					autoAlpha: 0.7,
					scale: 0.7,
					transformOrigin: '50% 50%'
				}
			});

			// Timeline
			todayTimeline.add(TweenMax.to(todayElement.find('#inner-halo-1'), TIMING * 0.625, {
				ease: 'Power2.easeInOut',
				css: {
					autoAlpha: 0,
					scale: 1.9,
					transformOrigin: '50% 50%'
				}
			}), 0);

			todayTimeline.add(TweenMax.to(todayElement.find('#inner-halo-1'), TIMING * 0.75, {
				ease: 'Power2.easeInOut',
				css: {
					autoAlpha: 0.7,
					scale: 0.7,
					transformOrigin: '50% 50%'
				}
			}), TIMING);

			todayTimeline.add(TweenMax.to(todayElement.find('#inner-halo-2'), TIMING, {
				ease: 'Power2.easeInOut',
				css: {
					autoAlpha: 0,
					scale: 1.75,
					transformOrigin: '50% 50%'
				}
			}), 0);

			todayTimeline.add(TweenMax.to(todayElement.find('#inner-halo-2'), TIMING, {
				ease: 'Power2.easeInOut',
				css: {
					autoAlpha: 0.7,
					scale: 0.7,
					transformOrigin: '50% 50%'
				}
			}), TIMING);

			todayTimeline.add(TweenMax.to(todayElement.find('#outter-halo'), TIMING, {
				ease: 'Back.easeInOut',
				css: {
					scale: 1.35,
					autoAlpha: 0.12,
					transformOrigin: '50% 50%'
				}
			}), 0);

			todayTimeline.add(TweenMax.to(todayElement.find('#outter-halo'), TIMING, {
				ease: 'Back.easeInOut',
				css: {
					scale: 1,
					autoAlpha: 0.5,
					transformOrigin: '50% 50%'
				}
			}), TIMING);

			todayTimeline.add(TweenMax.to(todayElement.find('.dot-blue'), TIMING, {
				ease: 'Back.easeInOut',
				css: {
					scale: 1.3,
					transformOrigin: '50% 50%'
				}
			}), 0);

			todayTimeline.add(TweenMax.to(todayElement.find('.dot-blue'), TIMING, {
				ease: 'Back.easeInOut',
				css: {
					scale: 1,
					transformOrigin: '50% 50%'
				}
			}), TIMING);

			// Future
			element.find('.future .future-dot').toArray().forEach(function(dot){
				var origin = (50 + Math.random() * 15) + '% ' + (50 + Math.random() * 15) + '%';

				TweenMax.to(element.find(dot), 12 + Math.random() * 13, {
					ease: 'Power0.easeIn',
					repeat: -1,
					css: {
						rotation: 360,
						transformOrigin: origin
					}
				});
			});
		}
	};
}]);

'use strict';

angular.module('app').filter('trustAsResourceUrl', ["$sce", function($sce){
	return function(url){
		return $sce.trustAsResourceUrl(url);
	};
}]);



'use strict';

/**
 * @ngdoc directive
 * @name view-upgrade
 * @description
 * OpenWebGames Upgrade Page UI
 */
angular.module('app').directive('viewUpgrade', ["browser", "$timeout", function(browser, $timeout){
	return {
		restrict: 'C',
		scope: true,
		link: function(scope){

			// default to tab selection to stable
			if (!scope.selectedTab) {
				scope.selectedTab = 'stable';
			}

			// organize browsers by stable and experimental
			var browsers = _.partition(_.shuffle(browser.getBrowsers()), function(browser){
				return !browser.development;
			});
			scope.stableBrowsers = browsers[0];
			scope.experimentalBrowsers = browsers[1];

			// perform browser measurements after digest cycle has completed
			$timeout(function(){

				// examine viewport
				var viewportWidth = $(window).width();

				// hide experimental browsers
				if (viewportWidth >= 1100){

					// large screens
					$('.experimentalBrowsers').css({
						display		: 'block',
						position	: 'relative',
						top			: 0,
						marginTop	: -343,
						opacity		: 0,
						zIndex		: -10
					});

				} else {

					// small screens
					$('.experimentalBrowsers').css({
						display		: 'block',
						position	: 'absolute',
						opacity		: 0,
						zIndex		: -10
					});

				}

				// show stable browsers
				$('.stableBrowsers').css({
					display	: 'block',
					opacity	: 1
				});

				// animate stable browsers in
				var stableIcons = $('a.browser-stable');
				TweenMax.staggerFrom(stableIcons, 0.8, {opacity:0, y:600, ease:Back.easeOut.config(0.7)}, 0.1);

				/**
				 * select stable browsers for user
				 *
				 * @param {Void}
				 * @return {Void}
				 */
				scope.selectStableBrowsers = function(){

					scope.selectedTab = 'stable';

					var stableIcons = $('a.browser-stable');
					var experimentalIcons = $('a.browser-experimental');

					// place stable browsers in front of experimental browsers
					$('.stableBrowsers').css({display: 'block', opacity: 1, zIndex: 10});
					$('.experimentalBrowsers').css({zIndex: -10});

					// prevent excessive height on small screens
					if (viewportWidth < 1100){
						$('.view-upgrade .container').css({maxHeight: 2000});
					}

					TweenMax.staggerTo(stableIcons, 0.8, {opacity:1, y:0, ease:Back.easeOut.config(0.7)}, 0.1);
					TweenMax.staggerTo(experimentalIcons, 0.8, {opacity:0, y:600, ease:Back.easeOut.config(0.7)}, 0.1);
				};

				/**
				 * select experimental browsers for user
				 *
				 * @param {Void}
				 * @return {Void}
				 */
				scope.selectExperimentalBrowsers = function(){

					scope.selectedTab = 'experimental';

					var stableIcons = $('a.browser-stable');
					var experimentalIcons = $('a.browser-experimental');

					// show experimental browsers
					if (viewportWidth >= 1100){

						// large screens
						$('.experimentalBrowsers').css({
							position	: 'relative',
							top			: 0,
							marginTop	: -343,
							opacity		: 1,
							zIndex		: 10
						});

					} else {

						// small screens
						$('.experimentalBrowsers').css({
							position	: 'absolute',
							opacity		: 1,
							zIndex		: 10
						});

						// prevent excessive height on small screens
						$('.view-upgrade .container').css({maxHeight: 1300});
					}

					// animate stable browsers out and experimental browsers in
					TweenMax.staggerTo(experimentalIcons, 0.8, {opacity:1, y:0, ease:Back.easeOut.config(0.7)}, 0.1);
					TweenMax.staggerTo(stableIcons, 0.8, {opacity:0, y:600, ease:Back.easeOut.config(0.7)}, 0.1);

				};

			});

		}
	};

}]);
