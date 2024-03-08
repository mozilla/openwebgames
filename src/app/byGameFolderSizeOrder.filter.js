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

