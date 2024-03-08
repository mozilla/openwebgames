'use strict';

/**
 * @ngdoc interface
 * @name $templateCache.getKeys
 * @description
 * Adds getKeys to $templateCache.
 */
angular.module('app')
	.config(function config($provide){
		$provide.decorator('$templateCache', function($delegate){
			var keys = [], origPut = $delegate.put;
			$delegate.put = function(key, value) {
				origPut(key, value);
				keys.push(key);
			};
			$delegate.getKeys = function() {
				return keys;
			};
			return $delegate;
		});
	});

