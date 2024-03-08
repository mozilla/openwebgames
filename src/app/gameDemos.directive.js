
/**
 * @ngdoc directive
 * @name game-demos
 * @description
 * Game Demos
 */
angular.module('app').directive('gameDemos', function(game, gameSupport, $compile, $filter, $templateCache, $timeout){
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
});

