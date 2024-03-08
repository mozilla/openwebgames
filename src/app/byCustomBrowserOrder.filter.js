'use strict';

/**
 * @ngdoc filter
 * @name byCustomBrowserOrder
 * @description
 * Get recommended browsers via a custom (client-defined) order.
 */
angular.module('app').filter('byCustomBrowserOrder', function(){
	return function(browsers){
		var split = _.partition(browsers, function(browser){
			return !browser.development;
		});
		split[0] = _.shuffle(split[0]);
		split[1] = _.shuffle(split[1]);
		return _.flatten(split);
	};
});


