'use strict';

/**
 * @ngdoc directive
 * @name view-report
 * @description
 * Report directive
 */
angular.module('app').directive('viewReport', function(){
	return {
		restrict: 'C',
		scope: true,
		link: function(scope, element){

			var content = $('.content');
			var confirmation = element.find('.confirmation');
			var confirmationSuccess = element.find('.confirmation .success');
			var confirmationError = element.find('.confirmation .error');
			var button = element.find('.confirmation button.close');

			scope.resetConfirmation = function(){
				confirmation.addClass('is-hidden');
				confirmationSuccess.addClass('is-hidden');
				confirmationError.addClass('is-hidden');
			};

			scope.showConfirmation = function(success){
				scope.resetConfirmation();
				document.body.scrollTop = document.documentElement.scrollTop = 0;
				if (success){
					confirmationSuccess.removeClass('is-hidden');
				} else {
					confirmationError.removeClass('is-hidden');
				}
				content.addClass('blur');
				confirmation.removeClass('is-hidden');
			};

			scope.hideConfirmation = function(){
				content.removeClass('blur');
				confirmation.addClass('is-hidden');
			};

			button.on('click', function(){
				scope.hideConfirmation();
			});

		}
	};
});

