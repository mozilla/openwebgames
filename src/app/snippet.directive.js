'use strict';

/**
 * @ngdoc directive
 * @name snippet
 * @description
 * Generic snippet include functionality
 */
angular.module('app').directive('snippet', function($compile, $templateCache){
	return {
		restrict: 'A',
		link: function(scope, elem, attr){

			var html = $templateCache.get(attr.snippet + '.html');
			if (html){

				// show template
				elem.html(html).show();

				// compile scope
				$compile(elem.contents())(scope);

			}

		}
	};
});

