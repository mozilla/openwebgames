'use strict';

/**
 * @ngdoc directive
 * @name logo
 * @description
 * OpenWebGames Logo
 */
angular.module('app').directive('logo', function(){
	return {
		restrict: 'C',
		templateUrl: 'logo.html'
	};
});

