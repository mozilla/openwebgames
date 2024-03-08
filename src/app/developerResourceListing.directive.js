'use strict';

/**
 * @ngdoc directive
 * @name developer-resource-listing
 * @description
 * List developer resources
 */
angular.module('app').directive('developerResourceListing', function($filter, developerResource){
	return {
		restrict: 'C',
		link: function(scope){
			var byCustomResourceOrder = $filter('byCustomResourceOrder');
			scope.resources = byCustomResourceOrder(developerResource.getResources());
		}
	};
});

