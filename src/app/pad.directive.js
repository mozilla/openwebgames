'use strict';

/**
 * @ngdoc directive
 * @name pad
 * @description
 * Create a functional game pad experience for the home page
 */
angular.module('app').directive('pad', function(){
	return {
		restrict: 'A',
		scope: false,
		link: function(scope, elem){

			elem.find('g[direction]').each(function(idx, el){
				var dir = angular.element(el).attr('direction');
				angular.element(el).on('click', function(){
					scope.triggerArrow(dir);
				});
			});

		}
	};
});

