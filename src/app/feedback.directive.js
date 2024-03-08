'use strict';

/**
 * @ngdoc directive
 * @name feedback
 * @description
 * Submit feedback to API and updated feedback form
 */
angular.module('app').directive('feedback', function($http){
	return {
		restrict: 'C',
		link: function(scope, elem){
			elem.on('submit', function(){

				var text = elem.find('textarea');
				if (!text.val()){
					return console.error('nothing to submit');
				}

				var success = function(){
					text.val('');
					scope.showConfirmation(true);
				};

				var error = function(){
					scope.showConfirmation(false);
				};

				$http.post('/feedback', {text: text.val()}).success(success).error(error);

			});
		}
	};
});


