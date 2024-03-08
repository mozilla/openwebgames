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

