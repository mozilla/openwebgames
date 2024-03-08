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

