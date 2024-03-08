'use strict';

angular.module('app').filter('trustAsResourceUrl', function($sce){
	return function(url){
		return $sce.trustAsResourceUrl(url);
	};
});


