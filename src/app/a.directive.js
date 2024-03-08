'use strict';

/**
 * @ngdoc directive
 * @name a
 * @description
 * Intercept anchor tag href requests and properly support "anchor" links in page
 */
angular.module('app').directive('a', function($anchorScroll){
	return {
		restrict: 'E',
		link: function(scope, elem, attr){
			if (attr.href && attr.href.match(/#[^\/]/)){
				$(elem).on('click', function(e){
					e.preventDefault();
					$anchorScroll(attr.href.substr(1));
				});
			}
		}
	};
});

