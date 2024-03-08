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

