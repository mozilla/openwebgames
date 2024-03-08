'use strict';

/**
 * @ngdoc service
 * @name easing
 * @description
 * Easing equations
 */
angular.module('app').factory('easing', function(){

	function easeInQuad(t, b, c, d){
		return c*(t/=d)*t + b;
	}

	return {
		easeInQuad : easeInQuad
	};

});

