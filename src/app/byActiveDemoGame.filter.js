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

