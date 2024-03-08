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

