'use strict';

/**
 * @ngdoc directive
 * @name features
 * @description
 * View directive
 */
angular.module('app').directive('viewFeatures', function($filter, $state, $timeout, browser, game, gameSupport){
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
});
