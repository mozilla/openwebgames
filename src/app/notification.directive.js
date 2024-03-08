'use strict';

/**
 * @ngdoc directive
 * @name notification
 * @description
 * OpenWebGames Notification Bar UI Component
 */
angular.module('app').directive('notification', function(){
	return {
		restrict: 'C',
		templateUrl: 'notification.html',
		scope: false,
		link: function(scope, elem){


			if (!scope.currentBrowser.browser.latest){
				var name = scope.currentBrowser.browser.name;
				var stable = scope.currentBrowser.browser.stable.replace(/\..*$/, '');
				scope.status = 'Upgrade ' + name + ' to ' + stable + '!';
			}

			scope.$watch('status', function(value){
				if (value){
					elem.parent('body').addClass('notification');
					elem.find('.inner').addClass('active');
				} else {
					elem.parent('body').removeClass('notification');
					elem.find('.inner').removeClass('active');
				}
			});

		}
	};
});

