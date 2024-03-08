'use strict';

/**
 * @ngdoc service
 * @name developer-resource
 * @description
 * Identify developer resources
 */
angular.module('app').factory('developerResource', function(){

	var resources = [
		{
			name: 'Mozilla Developer Network',
			icon: '/assets/img/resources/mdn.png',
			url: 'https://developer.mozilla.org/'
		},
		{
			name: 'Microsoft Developer Network',
			icon: '/assets/img/resources/msdn.png',
			url: 'https://insider.windows.com/'
		},
		{
			name: 'Google Developer Network',
			icon: '/assets/img/resources/chromium.png',
			url: 'https://developers.google.com/games/'
		},
	];

	function getResources(){
		return resources;
	}

	return {
		getResources : getResources
	};

});

