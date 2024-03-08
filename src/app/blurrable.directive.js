'use strict';

/**
 * @ngdoc directive
 * @name blurrable
 * @description
 * Defines page content elements that should be blurred during modal events
 */
angular.module('app').directive('blurrable', function($rootScope){
	return {
		restrict: 'A',
		link: function(scope, elem, attr){

			if (!$rootScope.blurrables){

				function getBlurClass(){
					var isBlurrable = true;
					if (scope.isMobile){
						isBlurrable = false;
					} else if (scope.currentBrowser){
						if (/edge/i.test(scope.currentBrowser.engine.name)){
							isBlurrable = false;
						}
					}
					return isBlurrable ? 'blur' : 'blur-fallback';
				}

				function addBlur(key){
					if ($rootScope.blurrables[key]){
						_.each($rootScope.blurrables[key].elements, function(el){
							el.addClass(getBlurClass());
						});
						$rootScope.blurrables[key].blurred = true;
					}
				}

				function removeBlur(key){
					if ($rootScope.blurrables[key]){
						_.each($rootScope.blurrables[key].elements, function(el){
							el.removeClass(getBlurClass());
						});
						$rootScope.blurrables[key].blurred = false;
					}
				}

				$rootScope.blurrables = {};

				$rootScope.blur = function(key){
					addBlur(key || 'default');
				};

				$rootScope.unblur = function(key){
					removeBlur(key || 'default');
				};

				$rootScope.blurred = function(key){
					return ($rootScope.blurrables[key || 'default'].blurred);
				};

			}

			var key = attr.blurrable || 'default';

			if (!$rootScope.blurrables[key]){
				$rootScope.blurrables[key] = {
					blurred: false,
					elements: []
				};
			}

			$rootScope.blurrables[key].elements.push(elem);

		}
	};
});

