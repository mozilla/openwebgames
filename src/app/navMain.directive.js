'use strict';

/**
 * @ngdoc directive
 * @name nav-main
 * @description
 * OpenWebGames Main Navigation UI Component
 */
angular.module('app').directive('navMain', function($document, $timeout, $rootScope){
	return {
		restrict: 'E',
		templateUrl: 'navMain.html',
		scope: {},
		link: function(scope, element){
			scope.showMenu = false;

			var document = $document[0];
			var icon = element[0].querySelector('.nav-main__icon');

			var openMenu = function(){
				scope.showMenu = true;
				$rootScope.blur();

				$timeout(function(){ document.addEventListener('click', closeMenu); });
			};

			var closeMenu = function(){
				document.removeEventListener('click', closeMenu);

				scope.showMenu = false;
				$rootScope.unblur();
			};

			icon.addEventListener('click', openMenu);

			// Cleanup listeners
			element.on('$destroy', function(){
				icon.removeEventListener('click', openMenu);
				document.removeEventListener('click', closeMenu);
			});
		}
	};
});
