'use strict';

/**
 * @ngdoc directive
 * @name privacy-link
 * @description
 * Open privacy policy from nav item
 */
angular.module('app').directive('privacyLink', function($window){
	return {
		restrict: 'C',
		scope: false,
		link: function(scope, elem){

			elem.on('click', function(){
				$window.open('https://www.mozilla.org/privacy/websites/');
			});

		}
	};
});



