'use strict';

/**
 * @ngdoc directive
 * @name capture-mouse
 * @description
 * Capture mouse events
 */
angular.module('app').directive('captureMouse', function($timeout){
	return {
		restrict: 'C',
		scope: false,
		link: function(scope, elem){

			function triggerMouseMove(){
				angular.element('body').addClass('mouse-move');
				$timeout(function(){
					angular.element('body').removeClass('mouse-move');
				}, 250);
			}

			function triggerMouseClick(){
				angular.element('body').addClass('mouse-click');
				$timeout(function(){
					angular.element('body').removeClass('mouse-click');
				}, 250);
			}

			elem.on('mousemove', function(){
				triggerMouseMove();
			});

			elem.on('click', function(){
				triggerMouseClick();
			});

		}
	};
});

