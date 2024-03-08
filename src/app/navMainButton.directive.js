'use strict';

/**
 * @ngdoc directive
 * @name nav-main-button
 * @description
 * OpenWebGames Main Navigation UI Component's Button
 */
angular.module('app').directive('navMainButton', function($state){
	return {
		restrict: 'E',
		templateUrl: 'navMainButton.html',
		transclude: true,
		scope: {},
		link: function(scope, elem, attr){
			if (attr.slug !== null) {
				scope.slug = attr.slug;
			}

			scope.navigate = function(){
				if (!scope.slug) {
					return;
				}

				$state.go('app.page', {slug: scope.slug});
			};

			scope.isActive = !scope.slug ? false : $state.params.slug === scope.slug;

			scope.$on('$stateChangeSuccess', function(event, toState, toParams){
				scope.isActive = !scope.slug ? false : toParams.slug === scope.slug;
			});
		}
	};
});
