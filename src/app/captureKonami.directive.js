'use strict';

/**
 * @ngdoc directive
 * @name capture-konami
 * @description
 * Capture konami key sequence events
 */
angular.module('app').directive('captureKonami', function(){
	return {
		restrict: 'C',
		scope: false,
		link: function(scope, elem){

			var konami = [];

			function triggerKonami(code){

				var seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
				var next = konami.length || 0;

				if (next === 10){
					if (code === 32 || code === 13){
						console.log('KONAMI!!!!');
						scope.status = 'KONAMI!!!';
						scope.$apply();
					}
					konami = [];
					return;
				}

				if (seq[next] === code){
					konami.push(code);
				}

			}

			elem.on('keydown', function(e){
				triggerKonami(e.which);
			});

		}
	};
});


