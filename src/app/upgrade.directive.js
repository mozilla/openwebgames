'use strict';

/**
 * @ngdoc directive
 * @name view-upgrade
 * @description
 * OpenWebGames Upgrade Page UI
 */
angular.module('app').directive('viewUpgrade', function(browser, $timeout){
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

});
