'use strict';

/**
 * @ngdoc directive
 * @name capture-arrows
 * @description
 * Capture arrow key events
 */
angular.module('app').directive('captureArrows', function($timeout, $rootScope, easing, navigation){
	return {
		restrict: 'C',
		scope: false,
		link: function(scope, element){

			scope.triggerArrow = function(direction){

				// temporarily add arrow direction class (css animations)
				angular.element('body').addClass('arrow-' + direction);
				$timeout(function(){
					angular.element('body').removeClass('arrow-' + direction);
				}, 250);

				// perform navigation
				navigation.navigateByDirection(direction).catch(function (error){
					if (!_.isString(error)) {
						throw error;
					}
				});

			};

			element.on('keydown', function(event){

				if (!$rootScope.blurred()){

					var direction;

					switch(event.which){
						case 37:
							direction = 'left';
							break;
						case 38:
							direction = 'up';
							break;
						case 39:
							direction = 'right';
							break;
						case 40:
							direction = 'down';
							break;
						default:
							return;
					}

					scope.triggerArrow(direction);

				}

			});

		}
	};
});
