'use strict';

/**
 * @ngdoc directive
 * @name testDrive
 * @description
 * Automated test drive experience which plays games and captures performance results.
 */
angular.module('app').directive('testDrive', function($compile, $filter, $state, $templateCache, $interval, $timeout, game){

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
});
