'use strict';

/**
 * @ngdoc directive
 * @name nav-arrow
 * @description
 * OpenWebGames Down Navigation UI Component
 */
angular.module('app').directive('navArrow', function(navigation, $state){
	return {
		restrict: 'E',
		templateUrl: 'navArrowButton.html',
		scope: {},
		link: function(scope, element, attr){
			var direction = scope.direction = attr.direction;
			var transitionVars = {
				paused: true,
				ease: 'Quart.easeInOut',
				css: {}
			};

			switch (direction) {
				case 'up':
					transitionVars.css.y = '-120';
				break;
				case 'down':
					transitionVars.css.y = '120';
				break;
				case 'left':
					transitionVars.css.x = '-150%';
				break;
				case 'right':
					transitionVars.css.x = '150%';
				break;
			}

			var transition = TweenMax.to(element.find('.nav-arrow'), 0.2, transitionVars);

			function transitionIn(callback){
				transition.eventCallback('onReverseComplete', callback);
				transition.reverse();
			}

			function transitionOut(callback){
				transition.eventCallback('onComplete', callback);
				transition.play();
			}

			scope.$on('$stateChangeStart', function(event, toState, toParams){
				function updateScope(){
					var navDescriptor = navigation.getDescriptor(toParams.slug);

					if (!navDescriptor || !direction){
						return;
					}

					var nextDestination = navDescriptor.directions[direction];

					if (nextDestination){
						scope.slug = nextDestination.id;
						scope.name = nextDestination.name;
					} else {
						scope.slug = null;
						scope.name = null;
					}
				}

				// Update the navigation arrow immediately
				if (!$state.params.slug) {
					return updateScope();
				}

				transitionOut(function(){
					var deregister;
					var timeoutId;

					var onEnter = _.once(function() {
						if (deregister) {
							deregister();
						}

						clearTimeout(timeoutId);

						updateScope();
						transitionIn();
					});

					deregister = scope.$on('gsapifyRouter:enterSuccess', onEnter);
					timeoutId = setTimeout(onEnter, 201);
				});
			});

			function setTransitionDirection(){
				$state.transitionDirection = direction;
			}

			element.click(setTransitionDirection);

			element.on('$destroy', function(){
				element.unbind('click', setTransitionDirection);
			});
		}
	};
});
