'use strict';

/**
 * @ngdoc directive
 * @name capture-diagnostic-key
 * @description
 * Capture diagnostic hotkey (f12)
 */
angular.module('app').directive('captureDiagnosticKey', function($state){
	return {
		restrict: 'C',
		scope: false,
		link: function(scope, elem){

			function triggerDiagnostic(code){
				if (code === 123){
					$state.go('app.page', {slug: 'diagnostics'});
					scope.$apply();
				}
			}

			elem.on('keydown', function(e){
				triggerDiagnostic(e.which);
			});

		}
	};
});



